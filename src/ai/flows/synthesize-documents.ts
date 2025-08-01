// src/ai/flows/synthesize-documents.ts
'use server';
/**
 * @fileOverview A flow to synthesize and update PRD and EDD documents.
 * 
 * - synthesizeDocuments - Updates the PRD and EDD based on new information.
 * - SynthesizeDocumentsInput - The input type for the synthesizeDocuments function.
 * - SynthesizeDocumentsOutput - The return type for the synthesizeDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizeDocumentsInputSchema = z.object({
    analystNotes: z.string().describe("The analyst's summary of the LATEST user input. This contains only the new information to be incorporated."),
    prd: z.string().describe("The CURRENT version of the Product Requirements Document. This will be updated with the new information."),
    edd: z.string().describe("The CURRENT version of the Engineering Design Document. This will be updated with the new information."),
});
export type SynthesizeDocumentsInput = z.infer<typeof SynthesizeDocumentsInputSchema>;

const SynthesizeDocumentsOutputSchema = z.object({
    prd: z.string().describe("The updated Product Requirements Document in Markdown format."),
    edd: z.string().describe("The updated Engineering Design Document in Markdown format."),
});
export type SynthesizeDocumentsOutput = z.infer<typeof SynthesizeDocumentsOutputSchema>;


export async function synthesizeDocuments(input: SynthesizeDocumentsInput): Promise<SynthesizeDocumentsOutput> {
    return synthesizeDocumentsFlow(input);
}

const synthesizeDocumentsPrompt = ai.definePrompt({
    name: 'synthesizeDocumentsPrompt',
    input: { schema: SynthesizeDocumentsInputSchema },
    output: { schema: SynthesizeDocumentsOutputSchema },
    prompt: `You are the Synthesizer, an expert document writer. Your task is to intelligently UPDATE the Product Requirements Document (PRD) and the Engineering Design Document (EDD) with new information.

You will be given the current versions of the PRD and EDD, along with the Analyst's notes from the most recent user interaction.

Your goal is to integrate the new information from the Analyst's Notes into the correct sections of the existing documents. Do NOT rewrite the documents from scratch. Only modify the sections that are directly impacted by the new information. If a section doesn't exist yet, create it.

**Analyst's Notes (New Information to Incorporate):**
{{{analystNotes}}}

---

**Current PRD:**
{{{prd}}}

---

**Current EDD:**
{{{edd}}}

---

Now, generate the updated PRD and EDD in Markdown format. Ensure your entire response is a single, valid JSON object that adheres to the output schema, containing the updated 'prd' and 'edd' fields.`,
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
