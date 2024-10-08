import type { NewSuggestedEvent } from "@/lib/db/schema";
import type { NewEmail } from "@/lib/db/schema/emails";
import { env } from "@/lib/env.mjs";
import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { parseDate } from "chrono-node";
import { z } from "zod";

const MODEL_CHAR_LIMIT = 32000; // Adjust this value based on the model's limit

function truncateContent(content: string, limit: number): string {
	if (content.length <= limit) return content;
	return `${content.slice(0, limit)}... [Content truncated due to length]`;
}

export async function extractEventsFromEmail(email: NewEmail) {
	const groq = createGroq({
		baseURL: "https://api.groq.com/openai/v1",
		apiKey: env.GROQ_API_KEY,
	});

	const { content, ...metadata } = email;
	const truncatedContent = truncateContent(content, MODEL_CHAR_LIMIT);
	const plaintext_prompt = `
You will be given an email with metadata and content. Your task is to read the content and identify any events or meetings mentioned, then extract information about these events. Do not attempt to calculate dates or times. Instead, include relevant excerpts from the original text for dates and times. These will be processed by an external library.

Here is the email metadata:
<email_metadata>
${JSON.stringify(metadata)}
</email_metadata>

And here is the email content:
<email_content>
${truncatedContent}
</email_content>

Follow these steps:

1. Carefully read the email content.

2. Identify any mentions of events or meetings. Look for keywords such as "meeting", "event", "conference", "appointment", "party", "invited", etc.

3. For each event identified, extract the following information:
   - Event Name
   - Organization (if mentioned)
   - Sender
   - Location
   - Start Time (include the relevant excerpt from the original text)
   - End Time (include the relevant excerpt from the original text, if mentioned)
   - Description (list of relevant details)
   - Registration Link (if mentioned, can find from metadata too if needed)

4. For dates and times, do not attempt to calculate or interpret them. Instead, include the relevant excerpts from the original text exactly as they appear.

5. If no events or meetings are mentioned in the email, return "N/A" for all fields.

6. Present your findings in the following format:

<event>
name: [Event name or "N/A"]
sender_org: [Organization or person's name or "N/A"]
location: [Location or "N/A"]
start_time: [Relevant excerpt for start time or "N/A"]
end_time: [Relevant excerpt for end time or "N/A"]
description: [Description of the event with relevant details or "N/A"]
registration_link: [Registration link or null if not mentioned]
</event>

If multiple events are mentioned, provide information for each event in separate <event> tags.

Remember, if there are no events mentioned in the email, your output should be:

<event>
name: "N/A"
sender_org: "N/A"
location: "N/A"
start_time: "N/A"
end_time: "N/A"
description: "N/A"
registration_link: null
</event>

Ensure that your output strictly follows the format specified above, as it will be parsed programmatically.
`;

	const { object } = await generateObject({
		model: groq("llama-3.1-8b-instant"),
		output: "array",
		schema: z.object({
			name: z.string(),
			sender_org: z.string(),
			location: z.string(),
			start_time: z.string(),
			end_time: z.string(),
			description: z.string(),
			registration_link: z.string().url().nullable(),
		}),
		prompt: plaintext_prompt,
	});

	const events = object
		.map((event): NewSuggestedEvent & { start: Date | null } => ({
			...event,
			title: event.name,
			start: event.start_time !== "N/A" ? parseDate(event.start_time) : null,
			end: event.end_time !== "N/A" ? parseDate(event.end_time) : null,
		}))
		.filter((event): event is NewSuggestedEvent => event.start !== null);
	return events;
}
