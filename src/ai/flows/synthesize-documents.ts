// src/ai/flows/synthesize-documents.ts
'use server';
/**
 * @fileOverview A flow to synthesize and rewrite PRD and EDD documents.
 * 
 * - synthesizeDocuments - Rewrites the PRD and EDD from scratch.
 * - SynthesizeDocumentsInput - The input type for the synthesizeDocuments function.
 * - SynthesizeDocumentsOutput - The return type for the synthesizeDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeDocumentsInputSchema = z.object({
    conversationHistory: z.string().describe("The history of the conversation."),
    analystNotes: z.string().describe("The notes from the analyst, summarizing the key information gathered so far."),
});
export type SynthesizeDocumentsInput = z.infer<typeof SynthesizeDocumentsInputSchema>;

const SynthesizeDocumentsOutputSchema = z.object({
    prd: z.string().describe("The full Product Requirements Document, rewritten from scratch in Markdown format."),
    edd: z.string().describe("The full Engineering Design Document, rewritten from scratch in Markdown format."),
});
export type SynthesizeDocumentsOutput = z.infer<typeof SynthesizeDocumentsOutputSchema>;


export async function synthesizeDocuments(input: SynthesizeDocumentsInput): Promise<SynthesizeDocumentsOutput> {
    return synthesizeDocumentsFlow(input);
}

const synthesizeDocumentsPrompt = ai.definePrompt({
    name: 'synthesizeDocumentsPrompt',
    input: { schema: SynthesizeDocumentsInputSchema },
    output: { schema: SynthesizeDocumentsOutputSchema },
    prompt: `You are the Synthesizer, an expert document writer. Your task is to rewrite the Product Requirements Document (PRD) and the Engineering Design Document (EDD) from scratch on every turn. 

Use the full conversation history and the Analyst's notes to create complete, coherent, and professional-grade planning documents. Your goal is to produce documents that are well-structured, easy to understand, and cover all essential aspects of the product based on the information provided. The PRD and EDD should be in their most complete state, synthesizing information and inferring connections on every turn.

**Conversation History:**
{{{conversationHistory}}}

**Analyst's Notes (Summary of key information):**
{{{analystNotes}}}

---

Now, generate the complete PRD and EDD in Markdown format. Ensure your entire response is a single, valid JSON object that adheres to the output schema, containing the 'prd' and 'edd' fields.
`,
});


const synthesizeDocumentsFlow = ai.defineFlow(
  { 
    name: 'synthesizeDocumentsFlow', 
    inputSchema: SynthesizeDocumentsInputSchema,
    outputSchema: SynthesizeDocumentsOutputSchema,
},
  async (input) => {
    const { output } = await synthesizeDocumentsPrompt(input);
    return output!;
  }
);
