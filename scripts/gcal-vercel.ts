import { db } from "@/lib/db";
import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
const fs = require("node:fs");

const groq = createGroq({
	baseURL: "https://api.groq.com/openai/v1",
	apiKey: process.env.GROQ_API_KEY,
});

const allEvents = await db.query.suggestedEvents.findMany();
console.log(allEvents);

const plaintext_prompt = `
You will be given a list of events. Your task is to create a summary and description for each event. You will need to format the start and end times, timezones, and locations according to the instructions provided.

Here is the list of events:
<event_list>
${JSON.stringify(allEvents)}
</event_list>

Follow these steps:

1. Carefully read each event in the list.
2. To create the summary, reword the title into a concise phrase that captures the main idea of the event. Try to keep it under 6 words. If the event has a long title, you can use a shorter version that still conveys the main idea. Put the organization or associated person in the summary in brackets if mentioned. For example, if the event is titled "Webinar on Machine Learning by AI Society", the summary could be "[AI Society] Webinar on Machine Learning".
3. To create the description, use data from the description and include the registration link if there exists one.
4. For the start and end timezones, format them according to ISO 8601 time format. Assume EST time zone unless otherwise specified. If the end time is not provided, assume the event is 1 hour long and calculate the end time accordingly.
5. For the location, use the location provided in the event details. If there is no location provided, write Location Not Provided.
`;

const { object } = await generateObject({
	model: groq("llama-3.1-8b-instant"),
	output: "array",
	schema: z.object({
		summary: z.string(),
		description: z.string(),
		location: z.string(),
		start: z.object({
			dateTime: z.string(),
			timeZone: z.string(),
		}),
		end: z.object({
			dateTime: z.string(),
			timeZone: z.string(),
		}),
	}),
	prompt: plaintext_prompt,
});

console.log(object);
