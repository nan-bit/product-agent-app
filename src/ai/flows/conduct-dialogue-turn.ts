// src/ai/flows/conduct-dialogue-turn.ts
'use server';
/**
 * @fileOverview A flow to manage a conversational turn. This is "The Facilitator" agent.
 * Its job is to be the friendly, conversational face of the workshop, asking questions
 * to achieve a specific strategic goal.
 */

import { ai } from '@/ai/genkit';
// THE FIX: We now import the Zod schemas and types from a shared, client-safe file.
import {
  DialogueTurnInputSchema,
  DialogueTurnOutputSchema,
  type DialogueTurnInput,
  type DialogueTurnOutput,
} from '@/lib/types';

// The Zod schema definitions have been REMOVED from this file to comply with 'use server' rules.

export async function conductDialogueTurn(
  input: DialogueTurnInput
): Promise<DialogueTurnOutput> {
  return conductDialogueTurnFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dialogueTurnPrompt',
  input: { schema: DialogueTurnInputSchema },
  output: { schema: DialogueTurnOutputSchema },
  prompt: `You are "The Facilitator," an expert interviewer. Your job is to conduct a natural, one-question-at-a-time dialogue to achieve a specific goal for a product planning workshop. Your tone is encouraging, clear, and professional.

**Your Current Task:**
-   **Instruction:** {{{instruction}}}
-   **Goal for this Topic:** "{{{topicGoal}}}"
-   **Summary of User's Last Answer:** "{{{userSummary}}}"

**Instructions:**
Based on your task, formulate the single best question to ask the user next.

*   If your instruction is **START**: Introduce the new topic based on its goal in a friendly way and ask a broad, open-ended question to get the conversation started.
*   If your instruction is **CONTINUE**: The user's previous answer was too brief or vague. Acknowledge their last point (using the summary) and then ask a targeted, clarifying follow-up question to encourage them to provide more detail related to the topic's goal.

Return only a JSON object containing the next question.`,
});

const conductDialogueTurnFlow = ai.defineFlow(
  {
    name: 'conductDialogueTurnFlow',
    inputSchema: DialogueTurnInputSchema,
    outputSchema: DialogueTurnOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);