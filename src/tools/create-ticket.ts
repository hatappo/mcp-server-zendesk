import { z } from "zod";
import { getZendeskClient } from "../utils/zendesk-client.ts";

const CreateTicketSchema = z.object({
	subject: z.string().describe("Subject of the ticket"),
	comment: z.object({
		body: z.string().describe("Initial comment body"),
	}),
	requester: z
		.object({
			name: z.string().optional().describe("Requester name"),
			email: z.string().email().optional().describe("Requester email"),
		})
		.optional(),
	priority: z.enum(["urgent", "high", "normal", "low"]).optional().default("normal").describe("Ticket priority"),
	type: z.enum(["problem", "incident", "question", "task"]).optional().describe("Ticket type"),
	tags: z.array(z.string()).optional().describe("Tags to add to the ticket"),
});

export const createTicketTool = {
	name: "create_ticket",
	description: "Create a new support ticket in Zendesk",
	inputSchema: {
		type: "object",
		properties: {
			subject: { type: "string", description: "Subject of the ticket" },
			comment: {
				type: "object",
				properties: {
					body: { type: "string", description: "Initial comment body" },
				},
				required: ["body"],
			},
			requester: {
				type: "object",
				properties: {
					name: { type: "string", description: "Requester name" },
					email: { type: "string", description: "Requester email" },
				},
			},
			priority: {
				type: "string",
				enum: ["urgent", "high", "normal", "low"],
				description: "Ticket priority",
				default: "normal",
			},
			type: {
				type: "string",
				enum: ["problem", "incident", "question", "task"],
				description: "Ticket type",
			},
			tags: {
				type: "array",
				items: { type: "string" },
				description: "Tags to add to the ticket",
			},
		},
		required: ["subject", "comment"],
	},
};

export async function handleCreateTicket(args: any) {
	try {
		const validatedArgs = CreateTicketSchema.parse(args);
		const client = getZendeskClient();

		const ticketData = {
			ticket: {
				subject: validatedArgs.subject,
				comment: validatedArgs.comment,
				priority: validatedArgs.priority,
				type: validatedArgs.type,
				tags: validatedArgs.tags,
				requester: validatedArgs.requester,
			},
		};

		const response = await client.tickets.create(ticketData);
		const ticket = response.ticket;

		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							success: true,
							ticket: {
								id: ticket.id,
								url: ticket.url,
								subject: ticket.subject,
								status: ticket.status,
								priority: ticket.priority,
								type: ticket.type,
								created_at: ticket.created_at,
								updated_at: ticket.updated_at,
							},
						},
						null,
						2,
					),
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : "Unknown error occurred",
						},
						null,
						2,
					),
				},
			],
		};
	}
}
