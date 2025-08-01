// src/app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractInformation } from '@/ai/flows/extract-information';
import { synthesizeDocuments } from '@/ai/flows/synthesize-documents';
import { strategicQuestioning } from '@/ai/flows/strategic-questioning';
import { masterSchemaString } from '@/lib/agents/schema';
import type { GenkitConversationHistory } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userInput,
      conversationHistory,
      analystNotes: prevAnalystNotes,
      prd: prevPrd,
      edd: prevEdd,
    } = body;

    let currentConversationHistory: GenkitConversationHistory = conversationHistory || [];
    let currentAnalystNotes = prevAnalystNotes || '';
    let currentPrd = prevPrd || '';
    let currentEdd = prevEdd || '';
    
    // Create a string representation of the conversation for the prompts
    const stringifiedHistory = currentConversationHistory.map(turn => `${turn.role}: ${turn.parts[0].text}`).join('\n');

    if (userInput) {
      // 1. Analyst: Extract information from the new user input
      const extractionResult = await extractInformation({
        userInput,
        masterSchema: masterSchemaString,
        conversationHistory: stringifiedHistory,
      });
      
      // Append new notes to existing ones
      currentAnalystNotes = `${currentAnalystNotes}\n- ${extractionResult.extractedInformation}`.trim();

      // Add user message to history for subsequent steps
      currentConversationHistory.push({ role: 'user', parts: [{ text: userInput }] });
    }
    
    // 2. Synthesizer: Update documents based on all available information
    const synthesisResult = await synthesizeDocuments({
      conversationHistory: stringifiedHistory,
      analystNotes: currentAnalystNotes,
    });
    currentPrd = synthesisResult.prd;
    currentEdd = synthesisResult.edd;

    // 3. Strategist: Determine the next question to ask
    const strategicResult = await strategicQuestioning({
      prdDocument: currentPrd,
      eddDocument: currentEdd,
      schema: masterSchemaString,
      conversationHistory: stringifiedHistory,
    });
    const nextQuestion = strategicResult.nextQuestion;

    // Add agent's question to the history for the next turn
    currentConversationHistory.push({ role: 'model', parts: [{ text: nextQuestion }] });
    
    return NextResponse.json({
      nextQuestion,
      prd: currentPrd,
      edd: currentEdd,
      analystNotes: currentAnalystNotes,
      conversationHistory: currentConversationHistory,
    });
  } catch (error) {
    console.error('Error in agent route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process agent request.', details: errorMessage }, { status: 500 });
  }
}
