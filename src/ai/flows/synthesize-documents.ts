// Synthesize Documents Flow
'use server';

/**
 * @fileOverview This file defines the Genkit flow for synthesizing PRD and EDD documents.
 * 
 * - synthesizeDocuments - A function that orchestrates the document synthesis process.
 * - SynthesizeDocumentsInput - The input type for the synthesizeDocuments function.
 * - SynthesizeDocumentsOutput - The return type for the synthesizeDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeDocumentsInputSchema = z.object({
  conversationHistory: z.string().describe('The full conversation history between the user and the agent.'),
  analystNotes: z.string().describe('The notes from the Analyst agent, summarizing key information and insights.'),
});
export type SynthesizeDocumentsInput = z.infer<typeof SynthesizeDocumentsInputSchema>;

const SynthesizeDocumentsOutputSchema = z.object({
  prd: z.string().describe('The current draft of the Product Requirements Document (PRD).'),
  edd: z.string().describe('The current draft of the Engineering Design Document (EDD).'),
});
export type SynthesizeDocumentsOutput = z.infer<typeof SynthesizeDocumentsOutputSchema>;

export async function synthesizeDocuments(input: SynthesizeDocumentsInput): Promise<SynthesizeDocumentsOutput> {
  return synthesizeDocumentsFlow(input);
}

const synthesizeDocumentsPrompt = ai.definePrompt({
  name: 'synthesizeDocumentsPrompt',
  input: {schema: SynthesizeDocumentsInputSchema},
  output: {schema: SynthesizeDocumentsOutputSchema},
  prompt: `You are a lead writer specializing in creating clear and comprehensive Product Requirements Documents (PRDs) and Engineering Design Documents (EDDs).

  Based on the conversation history and the analyst's notes, rewrite the PRD and EDD from scratch to ensure they are always complete and coherent. Pay close attention to detail and use all available information to create high-quality documents.

  Conversation History: {{{conversationHistory}}}
  Analyst's Notes: {{{analystNotes}}}

  Your goal is to produce professional-grade planning documents that development teams can use to execute effectively. The PRD and EDD should be well-structured, easy to understand, and cover all essential aspects of the product.

  Ensure that the documents are always in their most complete state, synthesizing information and inferring connections on every turn.

  Output the PRD and EDD in plain text format. No need to add \`\`\`text\`\`\` blocks.

  PRD:
  {{prd}}

  EDD:
  {{edd}}`,
});

const synthesizeDocumentsFlow = ai.defineFlow(
  {
    name: 'synthesizeDocumentsFlow',
    inputSchema: SynthesizeDocumentsInputSchema,
    outputSchema: SynthesizeDocumentsOutputSchema,
  },
  async input => {
    const {output} = await synthesizeDocumentsPrompt(input);
    return output!;
  }
);
