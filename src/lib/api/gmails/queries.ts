import type { NewEmailParams } from "@/lib/db/schema";
import { type gmail_v1, google } from "googleapis";

type GmailMessage = gmail_v1.Schema$Message;

export async function getGmailEmails({
	token,
	maxResults = 75,
}: { token: string; maxResults?: number }): Promise<NewEmailParams[]> {
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({ access_token: token });

	const gmail = google.gmail({ version: "v1", auth: oauth2Client });

	try {
		const {
			data: { messages },
		} = await gmail.users.messages.list({
			userId: "me",
			maxResults,
		});

		if (!messages) {
			console.log("No messages found.");
			return [];
		}

		const emails = await Promise.all(
			messages
				.map((msg) => msg.id)
				.filter((id) => id !== null && id !== undefined)
				.map(async (id) => {
					const emailResponse = await gmail.users.messages.get({
						userId: "me",
						id,
					});
					return formatEmailJSON(emailResponse.data);
				}),
		);
		return emails;
	} catch (error) {
		console.error(
			"Error:",
			error instanceof Error ? error.message : String(error),
		);
		return [];
	}
}

function decodeBase64(data: string) {
	try {
		return Buffer.from(data, "base64").toString("utf-8");
	} catch (e) {
		console.error("Error decoding base64 data: ", e);
		return "";
	}
}

function formatEmailJSON(email: GmailMessage): NewEmailParams {
	const getHeader = (name: string) =>
		email.payload?.headers?.find((header) => header.name === name)?.value ?? "";

	const getContentAndURL = (
		message: GmailMessage,
	): {
		rawContent: string;
		links: string[];
	} => {
		// HTML scraper function to search for hyperlinks
		const scrapeHyperlinks = (html: string): string[] => {
			const urlRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
			const links: string[] = [];
			let match: RegExpExecArray | null;

			while ((match = urlRegex.exec(html)) !== null) {
				links.push(match[2]);
			}
			return links;
		};

		// Helper function to extract raw message parts (text/plain or text/html)
		const getMessageBody = (
			payload: gmail_v1.Schema$MessagePart | undefined,
		): {
			body: string;
			html: string;
		} => {
			let body = "";
			let html = "";
			if (payload?.parts) {
				for (const part of payload.parts) {
					if (part.parts) {
						// Recursively extract parts if there are nested parts
						const { body: nestedBody, html: nestedHtml } = getMessageBody(part);
						body += nestedBody;
						html += nestedHtml;
					} else if (part.mimeType === "text/plain") {
						if (part.body?.data) {
							body += decodeBase64(part.body.data);
						}
					} else if (part.mimeType === "text/html") {
						if (part.body?.data) {
							html += decodeBase64(part.body.data);
						}
					}
				}
			} else if (payload?.body?.data) {
				// If there's no 'parts', just grab the data from the payload body
				body = decodeBase64(payload.body.data);
			}
			return { body, html };
		};

		// Get the payload of the message
		const payload = message.payload;
		const { body, html } = getMessageBody(payload);
		const urls = scrapeHyperlinks(html);
		return { rawContent: body, links: urls };
	};
	const { rawContent, links } = getContentAndURL(email);

	return {
		subject: getHeader("Subject"),
		content: rawContent,
		sender: getHeader("From"),
		receivedAt: new Date(Number(email.internalDate)).toISOString(),
		links: JSON.stringify(links),
	};
}
