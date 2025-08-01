'use server';

/**
 * @fileOverview Implements the Strategic Questioning flow, which determines the most valuable question to ask next.
 *
 * - strategicQuestioning - A function that determines the next strategic question.
 * - StrategicQuestioningInput - The input type for the strategicQuestioning function.
 * - StrategicQuestioningOutput - The return type for the strategicQuestioning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategicQuestioningInputSchema = z.object({
  prdDocument: z.string().describe('The current draft of the Product Requirements Document.'),
  eddDocument: z.string().describe('The current draft of the Engineering Design Document.'),
  schema: z.string().describe('The master schema defining all possible topics and questions.'),
  conversationHistory: z.string().describe('The history of the conversation so far.'),
});
export type StrategicQuestioningInput = z.infer<typeof StrategicQuestioningInputSchema>;

const StrategicQuestioningOutputSchema = z.object({
  nextQuestion: z.string().describe('The next question to ask the user.'),
});
export type StrategicQuestioningOutput = z.infer<typeof StrategicQuestioningOutputSchema>;

export async function strategicQuestioning(input: StrategicQuestioningInput): Promise<StrategicQuestioningOutput> {
  return strategicQuestioningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'strategicQuestioningPrompt',
  input: {schema: StrategicQuestioningInputSchema},
  output: {schema: StrategicQuestioningOutputSchema},
  prompt: `You are an expert strategist, skilled at determining the most valuable question to ask next in order to efficiently gather information for product planning.

  Analyze the current state of the PRD, EDD, schema, and conversation history to identify the most critical information gaps.
  Propose a single, clear question that will provide the most valuable insights for completing the planning documents.

Current PRD Document:
{{{prdDocument}}}

Current EDD Document:
{{{eddDocument}}}

Schema:
{{{schema}}}

Conversation History:
{{{conversationHistory}}}

  Based on your analysis, what is the single most valuable question to ask next?`,
});

const strategicQuestioningFlow = ai.defineFlow(
  {
    name: 'strategicQuestioningFlow',
    inputSchema: StrategicQuestioningInputSchema,
    outputSchema: StrategicQuestioningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
