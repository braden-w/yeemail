import { generateObject } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { z } from 'zod';

const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: "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",
});

const { object } = await generateObject({
  model: groq('llama-3.1-70b-versatile'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'You will be given information about an email, including its subject, date, sender, and content. Read the content and see if there are any events mentioned. If there is, format accordingly, and if not, return N/A for all fields. Here is the information: ',
});

console.log('Name:', object.recipe.name, 'Ingredients:', object.recipe.ingredients, 'Steps:', object.recipe.steps);
