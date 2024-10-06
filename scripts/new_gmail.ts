import { type gmail_v1, google } from "googleapis";
import {
	createEmail,
	createMultipleEmails,
} from "src/lib/api/emails/mutations";

// Helper function to decode base64 URL-safe encoding
function decodeBase64(data: string) {
	try {
		return Buffer.from(data, "base64").toString("utf-8");
	} catch (e) {
		console.error("Error decoding base64 data: ", e);
		return "";
	}
}

type GmailMessage = gmail_v1.Schema$Message;

export async function getGmailEmails({
	token,
	maxResults = 75,
}: { token: string; maxResults?: number }): Promise<GmailMessage[]> {
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({ access_token: token });

	const gmail = google.gmail({ version: "v1", auth: oauth2Client });
	const emails: GmailMessage[] = [];

	try {
		const response = await gmail.users.messages.list({
			userId: "me",
			maxResults,
		});

		const messages = response.data.messages;
		if (!messages) {
			console.log("No messages found.");
			return [];
		}

		console.log("🚀 ~ fetchGmailEmails ~ messages:", messages);

		for (const msg of messages) {
			if (msg.id) {
				const emailResponse = await gmail.users.messages.get({
					userId: "me",
					id: msg.id,
				});

				if (emailResponse.data) {
					emails.push(emailResponse.data);
				}
			}
		}

		return emails;
	} catch (error) {
		console.error(
			"Error:",
			error instanceof Error ? error.message : String(error),
		);
		return [];
	}
}

function getContentAndURL(message: GmailMessage): [string, string[]] {
	// HTML scraper function to search for hyperlinks
	function scrapeHyperlinks(html: string): string[] {
		const urlRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
		const links: string[] = [];
		let match: RegExpExecArray | null;

		while ((match = urlRegex.exec(html)) !== null) {
			links.push(match[2]);
		}
		return links;
	}
	// Helper function to extract raw message parts (text/plain or text/html)
	function getMessageBody(
		payload: gmail_v1.Schema$MessagePart | undefined,
	): [string, string] {
		let body = "";
		let html = "";
		if (payload?.parts) {
			for (const part of payload.parts) {
				if (part.parts) {
					// Recursively extract parts if there are nested parts
					const [nestedBody, nestedHtml] = getMessageBody(part);
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
		return [body, html];
	}
	// Get the payload of the message
	const payload = message.payload;
	const [rawBody, rawHTML] = getMessageBody(payload);
	const urls = scrapeHyperlinks(rawHTML);
	return [rawBody, urls];
}

interface FormattedEmail {
	subject: string;
	content: string;
	sender: string;
	receivedAt: string;
	links: string;
}

function formatEmailJSON(emails: GmailMessage[]): FormattedEmail[] {
	const emailData: FormattedEmail[] = [];
	for (const email of emails) {
		const subject =
			email.payload?.headers?.find((header) => header.name === "Subject")
				?.value ?? "";
		const sender =
			email.payload?.headers?.find((header) => header.name === "From")?.value ??
			"";
		const dateTime = new Date(Number(email.internalDate)).toISOString();
		const [rawContent, links] = getContentAndURL(email);
		const formatted: FormattedEmail = {
			subject,
			content: rawContent,
			sender,
			receivedAt: dateTime,
			links: JSON.stringify(links),
		};
		emailData.push(formatted);
	}
	return emailData;
}

async function insertAllEmails({
	userToken,
	maxResults,
}: { userToken: string; maxResults: number }) {
	try {
		// Fetch emails from Gmail API
		const emails = await getGmailEmails({ token: userToken, maxResults });
		const emailData = formatEmailJSON(emails);
		const result = await createMultipleEmails(emailData);
		console.log(`${result.emails.length} emails inserted successfully.`);
	} catch (error) {
		console.error(
			"Error inserting emails:",
			error instanceof Error ? error.message : String(error),
		);
	}
}

async function insertOneEmail(userToken: string) {
	if (!userToken) {
		console.error("Error: User token is required.");
		return;
	}
	try {
		// Fetch emails from Gmail API
		const emails = await getGmailEmails({ token: userToken, maxResults: 1 });
		const emailData = formatEmailJSON(emails);
		if (emailData.length > 0) {
			const result = await createEmail(emailData[0]);
			console.log("Email inserted successfully:", result.email);
		} else {
			console.log("No emails found to insert.");
		}
	} catch (error) {
		console.error(
			"Error inserting email:",
			error instanceof Error ? error.message : String(error),
		);
	}
}

// Usage
// insertAllEmails({ userToken: process.env.USER_KEY ?? "", maxResults: 2 });
//insertOneEmail(process.env.USER_KEY ?? "");
