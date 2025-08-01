
// src/ai/flows/extract-information.ts
'use server';
/**
 * @fileOverview A flow to extract and map relevant information from user input to a master schema.
 *
 * - extractInformation - Extracts and maps user input to the master schema.
 * - ExtractInformationInput - The input type for the extractInformation function.
 * - ExtractInformationOutput - The return type for the extractInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInformationInputSchema = z.object({
  userInput: z.string().describe('The user input string to extract information from.'),
  masterSchema: z.string().describe('The master schema to map the extracted information to.'),
  conversationHistory: z.string().describe('The history of the conversation.'),
});
export type ExtractInformationInput = z.infer<typeof ExtractInformationInputSchema>;

const ExtractInformationOutputSchema = z.object({
  extractedInformation: z.string().describe('A concise summary of the key information extracted from the user input that is relevant to the master schema.'),
  contradictions: z.string().optional().describe('Any contradictions identified between the new user input and the previous conversation history.'),
});
export type ExtractInformationOutput = z.infer<typeof ExtractInformationOutputSchema>;

export async function extractInformation(input: ExtractInformationInput): Promise<ExtractInformationOutput> {
  return extractInformationFlow(input);
}

const extractInformationPrompt = ai.definePrompt({
  name: 'extractInformationPrompt',
  input: {schema: ExtractInformationInputSchema},
  output: {schema: ExtractInformationOutputSchema},
  prompt: `You are the Analyst, also known as the Chief of Staff. Your role is to analyze user input and map relevant information to a master schema. You also need to identify any contradictions in the user input.

Your primary goal is to extract only the NEW, RELEVANT information from the latest user input and summarize it concisely. Do not repeat information that is already in the conversation history.

Master Schema:
{{{masterSchema}}}

Conversation History:
{{{conversationHistory}}}

---
Latest User Input:
"{{{userInput}}}"
---

Based *only* on the "Latest User Input", extract the key information that maps to the master schema. Identify any contradictions with the "Conversation History".

Return a JSON object with your findings.`,
});

const extractInformationFlow = ai.defineFlow(
  {
    name: 'extractInformationFlow',
    inputSchema: ExtractInformationInputSchema,
    outputSchema: ExtractInformationOutputSchema,
  },
  async input => {
    const {output} = await extractInformationPrompt(input);
    return output!;
  }
);
