import { defineFlow } from 'genkit';
import { gemini15Pro } from 'genkit/ext/googleai'; // Assuming you'll use Pro for synthesis

export const synthesizeDocumentsFlow = defineFlow(
  { name: 'synthesizeDocumentsFlow', 
    inputSchema: z.object({
    conversationHistory: z.array(z.object({ role: z.string(), parts: z.array(z.object({ text: z.string() })) })),
    analystNotes: z.string(),
    prd: z.string(),
    edd: z.string(),
  }),
  outputSchema: z.object({
    prd: z.string(),
    edd: z.string(),
  }),
},
  async (input) => {
    const { conversationHistory, analystNotes, prd, edd } = input;

    // Use Gemini 1.5 Pro for synthesis for thoroughness
    const llmResponse = await gemini15Pro.generate({
      prompt: `Based on the conversation history and the analyst's notes, rewrite the PRD and EDD from scratch to ensure they are always complete and coherent. Pay close attention to detail and use all available information to create high-quality documents.

        Conversation History: ${JSON.stringify(conversationHistory)}
        Analyst's Notes: ${analystNotes}

        Your goal is to produce professional-grade planning documents that development teams can use to execute effectively. The PRD and EDD should be well-structured, easy to understand, and cover all essential aspects of the product.

        Ensure that the documents are always in their most complete state, synthesizing information and inferring connections on every turn.

        Output the PRD and EDD in **markdown format**, including headings, lists, and any other relevant markdown syntax to make them clean and readable.

        PRD:
        ${prd}

        EDD:
        ${edd}`,
        config: { maxOutputTokens: 4096 } // Increased output tokens for longer documents
    });

    const [updatedPrd, updatedEdd] = llmResponse.text().split('EDD:
');

    return {
      prd: updatedPrd.replace('PRD:
', '').trim(),
      edd: updatedEdd.trim(),
    };
  }
);

import { z } from 'zod';
