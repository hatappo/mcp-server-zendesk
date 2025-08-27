import { z } from "zod";
import { AuthContextManager } from "../utils/auth-context.js";
import { requestContext } from "../utils/request-context.js";
import { getZendeskClient } from "../utils/zendesk-client.js";

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

		// リクエストコンテキストから認証情報とロガーを取得
		const authContext = requestContext.getCurrentAuthContext();
		const logger = requestContext.getCurrentLogger();

		// 認証コンテキストを使用してZendeskクライアントを取得
		const client = getZendeskClient(authContext, logger);

		// リクエスタメールを動的に設定
		const authManager = AuthContextManager.getInstance(logger);
		const requesterEmail = authManager.getRequesterEmail(authContext, validatedArgs.requester?.email);

		// チケットデータを構築
		const ticketData = {
			ticket: {
				subject: validatedArgs.subject,
				comment: validatedArgs.comment,
				priority: validatedArgs.priority,
				type: validatedArgs.type,
				tags: validatedArgs.tags,
				requester: requesterEmail
					? {
							...validatedArgs.requester,
							email: requesterEmail,
						}
					: validatedArgs.requester,
			},
		};

		logger.info(
			{
				subject: validatedArgs.subject,
				requesterEmail,
				userEmail: authContext.userEmail,
				effectiveUsername: authContext.effectiveUsername,
			},
			"Creating Zendesk ticket",
		);

		const response = await client.tickets.create(ticketData);
		const ticket = response.ticket;

		logger.info(
			{
				ticketId: ticket.id,
				ticketUrl: ticket.url,
			},
			"Zendesk ticket created successfully",
		);

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
								requester_email: requesterEmail,
							},
						},
						null,
						2,
					),
				},
			],
		};
	} catch (error) {
		const logger = requestContext.getCurrentLogger();
		logger.error({ error }, "Failed to create Zendesk ticket");

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
