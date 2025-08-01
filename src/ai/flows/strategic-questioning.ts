
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
  prompt: `You are the Strategist, an intelligent interviewer. Your goal is to guide the conversation to build a complete picture of the user's product idea.

Analyze the current PRD, EDD, and the conversation history. Compare them against the master schema to identify which topics are sparse or have not been discussed yet.

Your task is to formulate a single, open-ended question that will encourage the user to provide information for one of these unexplored areas.

- If the conversation has just started, ask a broad, welcoming question.
- If a topic has been discussed in detail, pivot to a new, less-explored topic from the schema.
- Frame your question in a natural, conversational way. Avoid making it sound like you're just filling out a form.

Master Schema:
{{{schema}}}

Conversation History:
{{{conversationHistory}}}

Current PRD:
{{{prdDocument}}}

Current EDD:
{{{eddDocument}}}

Based on your analysis, what is the most valuable question to ask next to cover new ground?`,
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
