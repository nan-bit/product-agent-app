
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
  prompt: `You are an expert product ideation partner. Your goal is to have a natural, collaborative conversation with a user about their product idea.

Based on the conversation so far, ask a single, open-ended question to encourage the user to elaborate on their idea. Avoid questions that sound like you are filling out a form. Keep the conversation flowing naturally.

If the conversation is just starting, ask a broad question to get things started.

Conversation History:
{{{conversationHistory}}}

Based on the conversation, what is the best next question to ask?`,
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
