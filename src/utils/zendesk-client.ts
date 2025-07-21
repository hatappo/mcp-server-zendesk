import pkg from "node-zendesk";

const { createClient } = pkg;

let client: any | null = null;

export function getZendeskClient(): any {
	if (!client) {
		const subdomain = process.env.ZENDESK_SUBDOMAIN;
		const username = process.env.ZENDESK_USERNAME;
		const token = process.env.ZENDESK_API_TOKEN;

		if (!subdomain || !username || !token) {
			throw new Error(
				"Missing required Zendesk configuration. Please set ZENDESK_SUBDOMAIN, ZENDESK_USERNAME, and ZENDESK_API_TOKEN environment variables.",
			);
		}

		client = createClient({
			username: `${username}/token`,
			token,
			subdomain,
			helpcenter: true,
		} as any);
	}

	return client;
}
