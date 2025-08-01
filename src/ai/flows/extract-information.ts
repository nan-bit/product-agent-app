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
  extractedInformation: z.string().describe('The extracted information mapped to the master schema.'),
  contradictions: z.string().describe('Any contradictions identified in the user input.'),
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

Master Schema:
{{{masterSchema}}}

Conversation History:
{{{conversationHistory}}}

User Input:
{{{userInput}}}

Extract the relevant information from the user input, map it to the master schema, and identify any contradictions. Return the extracted information and any contradictions found.

Extracted Information:
{{extractedInformation}}

Contradictions:
{{contradictions}}`,
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
