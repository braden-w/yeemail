import { generateObject } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { z } from 'zod';
const fs = require('fs');

const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

const emailContent = fs.readFileSync('email.txt', 'utf-8');
const plaintext_prompt = "You will be given the payload of a list of emails. information about an email, including its subject, date, sender, and content. Read the content and see if there are any events or meetings mentioned. If there is, format accordingly, and if not, return N/A for all fields. Here is the information:" + emailContent;

const { object } = await generateObject({
  model: groq('llama-3.1-70b-versatile'),
  schema: z.object({
    event: z.object({
      name: z.string(),
      organization: z.string(),
      sender: z.string(),
      location: z.string(),
      date: z.string(),
      time: z.string(),
      description: z.array(z.string()),
      food: z.string(),
    }),
  }),
  prompt: plaintext_prompt,
});

console.log(object);
