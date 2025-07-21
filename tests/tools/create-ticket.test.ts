import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleCreateTicket, createTicketTool } from "../../src/tools/create-ticket.ts";

// Mock Zendesk client
const mockCreateTicket = vi.fn();
vi.mock("../../src/utils/zendesk-client.ts", () => ({
	getZendeskClient: vi.fn(() => ({
		tickets: {
			create: mockCreateTicket,
		},
	})),
}));

describe("Create Ticket Tool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createTicketTool definition", () => {
		it("should have correct tool definition", () => {
			expect(createTicketTool.name).toBe("create_ticket");
			expect(createTicketTool.description).toBe("Create a new support ticket in Zendesk");
			expect(createTicketTool.inputSchema.type).toBe("object");
			expect(createTicketTool.inputSchema.required).toEqual(["subject", "comment"]);
		});
	});

	describe("handleCreateTicket", () => {
		it("should handle successful ticket creation", async () => {
			const mockTicket = {
				id: 123,
				url: "https://example.zendesk.com/api/v2/tickets/123.json",
				subject: "Test Ticket",
				status: "new",
				priority: "normal",
				type: "question",
				created_at: "2023-01-01T00:00:00Z",
				updated_at: "2023-01-01T00:00:00Z",
			};

			mockCreateTicket.mockResolvedValue({ ticket: mockTicket });

			const result = await handleCreateTicket({
				subject: "Test Ticket",
				comment: {
					body: "This is a test ticket",
				},
				priority: "normal",
				type: "question",
			});

			expect(result.content[0].type).toBe("text");
			const response = JSON.parse(result.content[0].text);
			expect(response.success).toBe(true);
			expect(response.ticket.id).toBe(123);
			expect(response.ticket.subject).toBe("Test Ticket");
		});

		it("should handle validation errors", async () => {
			const result = await handleCreateTicket({
				// Missing required subject and comment
				priority: "normal",
			});

			expect(result.content[0].type).toBe("text");
			const response = JSON.parse(result.content[0].text);
			expect(response.success).toBe(false);
			expect(response.error).toContain("Required");
		});

		it("should handle API errors", async () => {
			mockCreateTicket.mockRejectedValue(new Error("API Error"));

			const result = await handleCreateTicket({
				subject: "Test Ticket",
				comment: {
					body: "This is a test ticket",
				},
			});

			expect(result.content[0].type).toBe("text");
			const response = JSON.parse(result.content[0].text);
			expect(response.success).toBe(false);
			expect(response.error).toBe("API Error");
		});

		it("should use default priority when not specified", async () => {
			const mockTicket = {
				id: 123,
				url: "https://example.zendesk.com/api/v2/tickets/123.json",
				subject: "Test Ticket",
				status: "new",
				priority: "normal",
				type: null,
				created_at: "2023-01-01T00:00:00Z",
				updated_at: "2023-01-01T00:00:00Z",
			};

			mockCreateTicket.mockResolvedValue({ ticket: mockTicket });

			await handleCreateTicket({
				subject: "Test Ticket",
				comment: {
					body: "This is a test ticket",
				},
			});

			expect(mockCreateTicket).toHaveBeenCalledWith({
				ticket: expect.objectContaining({
					priority: "normal",
				}),
			});
		});
	});
});