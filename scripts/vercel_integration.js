import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
const fs = require("node:fs");

const groq = createGroq({
	baseURL: "https://api.groq.com/openai/v1",
	apiKey: process.env.GROQ_API_KEY,
});

const emailContent = fs.readFileSync('content.txt', 'utf-8');
const emailMetadata = fs.readFileSync('metadata.txt', 'utf-8');
const plaintext_prompt = `
You will be given an email with metadata and content. Your task is to read the content and identify any events or meetings mentioned, then extract information about these events. Do not attempt to calculate dates or times. Instead, include relevant excerpts from the original text for dates and times. These will be processed by an external library.

Here is the email metadata:
<email_metadata>
${ emailMetadata }
</email_metadata>

And here is the email content:
<email_content>
${ emailContent }
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
description: [Array of relevant details]
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
description: []
registration_link: null
</event>

Ensure that your output strictly follows the format specified above, as it will be parsed programmatically.
`;

const { object } = await generateObject({
    model: groq('llama-3.1-70b-versatile'),
    schema: z.object({
        events: z.array(
            z.object({
                name: z.string(),
                sender_org: z.string(),
                location: z.string(),
                start_time: z.string(),
                end_time: z.string(),
                description: z.array(z.string()),
                registration_link: z.string().url()
            })
        )
    }),
    prompt: plaintext_prompt,
});

console.log(object);
