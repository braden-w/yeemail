import {
	createEmail,
	createMultipleEmails,
} from "src/lib/api/emails/mutations";
import { z } from "zod";

// Helper function to decode base64 URL-safe encoding
function decodeBase64(data: string) {
	try {
		return atob(data.replace(/_/g, "/").replace(/-/g, "+"));
	} catch (e) {
		console.error("Error decoding base64 data: ", e);
		return "";
	}
}

const GmailMessageSchema = z.object({
	id: z.string(),
	threadId: z.string(),
	payload: z.object({
		headers: z.array(
			z.object({
				name: z.string(),
				value: z.string(),
			}),
		),
		parts: z
			.array(
				z.object({
					mimeType: z.string(),
					body: z
						.object({
							data: z.string().optional(),
						})
						.optional(),
					parts: z.array(z.unknown()).optional(),
				}),
			)
			.optional(),
		body: z
			.object({
				data: z.string().optional(),
			})
			.optional(),
	}),
	internalDate: z.string(),
});

type GmailMessage = z.infer<typeof GmailMessageSchema>;

async function getGmailEmails(
	token: string,
	maxResults = 75,
): Promise<GmailMessage[]> {
	const baseUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
	const headers = { Authorization: `Bearer ${token}` };
	const emails: GmailMessage[] = [];

	try {
		const response = await fetch(`${baseUrl}?maxResults=${maxResults}`, {
			headers,
		});
		if (!response.ok) {
			throw new Error(
				`Error fetching email list: ${response.status} ${await response.text()}`,
			);
		}

		const data = await response.json();
		const responseSchema = z.object({
			messages: z.array(
				z.object({
					id: z.string(),
					threadId: z.string(),
				}),
			),
		});
		const parsedData = responseSchema.parse(data);
		const messages = parsedData.messages;
		console.log("🚀 ~ fetchGmailEmails ~ messages:", messages);

		// Fetch email details for each ID
		for (const msg of messages) {
			const emailId = msg.id;
			const emailUrl = `${baseUrl}/${emailId}`;
			const emailResponse = await fetch(emailUrl, { headers });
			if (emailResponse.ok) {
				const emailData = await emailResponse.json();
				const parsedEmailData = GmailMessageSchema.parse(emailData);
				emails.push(parsedEmailData);
			} else {
				console.error(
					`Error fetching email ${emailId}: ${emailResponse.status}`,
				);
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
			const url = match[2];
			links.push(url);
		}
		return links;
	}
	// Helper function to extract raw message parts (text/plain or text/html)
	function getMessageBody(payload: GmailMessage["payload"]): [string, string] {
		let body = "";
		let html = "";
		if (payload.parts) {
			for (const part of payload.parts) {
				if (part.parts) {
					// Recursively extract parts if there are nested parts
					const [nestedBody, nestedHtml] = getMessageBody(
						part as GmailMessage["payload"],
					);
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
		} else if (payload.body?.data) {
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

const FormattedEmailSchema = z.object({
	subject: z.string(),
	content: z.string(),
	sender: z.string(),
	receivedAt: z.date(),
	links: z.string(),
});

type FormattedEmail = z.infer<typeof FormattedEmailSchema>;

function formatEmailJSON(emails: GmailMessage[]): FormattedEmail[] {
	const emailData: FormattedEmail[] = [];
	for (const email of emails) {
		const subject =
			email.payload.headers.find((header) => header.name === "Subject")
				?.value ?? "";
		const sender =
			email.payload.headers.find((header) => header.name === "From")?.value ??
			"";
		const dateTime = new Date(parseInt(email.internalDate, 10));
		const [rawContent, links] = getContentAndURL(email);
		const formatted = FormattedEmailSchema.parse({
			subject,
			content: rawContent,
			sender,
			receivedAt: dateTime,
			links: JSON.stringify(links),
		});
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
		const emails = await getGmailEmails(userToken, maxResults);
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
		const emails = await getGmailEmails(userToken, 1);
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
insertAllEmails({ userToken: process.env.USER_KEY ?? "", maxResults: 2 });
//insertOneEmail(process.env.USER_KEY ?? "");
