
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
  console.log('\n\n---AGENT ROUTE HIT---');
  try {
    const body = await req.json();
    console.log('[AGENT_ROUTE] Received request body:', JSON.stringify(body, null, 2));

    const {
      userInput,
      conversationHistory,
      analystNotes: prevAnalystNotes,
      prd: prevPrd,
      edd: prevEdd,
      uxd: prevUxd,
      pdd: prevPdd,
    } = body;

    let currentConversationHistory: GenkitConversationHistory = conversationHistory || [];
    let currentAnalystNotes = prevAnalystNotes || '';
    let currentPrd = prevPrd || '';
    let currentEdd = prevEdd || '';
    let currentUxd = prevUxd || '';
    let currentPdd = prevPdd || '';
    
    // Create a string representation of the conversation for the prompts
    const stringifiedHistory = currentConversationHistory.map(turn => `${turn.role}: ${turn.parts[0].text}`).join('\n');
    let latestAnalystNote = '';

    if (userInput) {
      // 1. Analyst: Extract information from the new user input
      console.log('\n[AGENT_ROUTE] ==> 1. Calling Analyst (extractInformation)...');
      const analystInput = {
        userInput,
        masterSchema: masterSchemaString,
        conversationHistory: stringifiedHistory,
      };
      console.log('[AGENT_ROUTE] Analyst Input:', JSON.stringify(analystInput, null, 2));

      const extractionResult = await extractInformation(analystInput);
      console.log('[AGENT_ROUTE] <== 1. Analyst Output:', JSON.stringify(extractionResult, null, 2));
      
      latestAnalystNote = extractionResult.extractedInformation;
      // Append new notes to existing ones
      currentAnalystNotes = `${currentAnalystNotes}\n- ${extractionResult.extractedInformation}`.trim();

      // Add user message to history for subsequent steps
      currentConversationHistory.push({ role: 'user', parts: [{ text: userInput }] });
    } else {
        console.log('\n[AGENT_ROUTE] No user input provided, proceeding to generate initial question.');
    }
    
    // 2. Synthesizer: Update documents based on the latest analyst note
    console.log('\n[AGENT_ROUTE] ==> 2. Calling Synthesizer (synthesizeDocuments)...');
    const synthesizerInput = {
      analystNotes: latestAnalystNote,
      prd: currentPrd,
      edd: currentEdd,
      uxd: currentUxd,
      pdd: currentPdd,
    };
    console.log('[AGENT_ROUTE] Synthesizer Input:', JSON.stringify(synthesizerInput, null, 2));
    
    const synthesisResult = await synthesizeDocuments(synthesizerInput);
    console.log('[AGENT_ROUTE] <== 2. Synthesizer Output:', JSON.stringify(synthesisResult, null, 2));

    currentPrd = synthesisResult.prd;
    currentEdd = synthesisResult.edd;
    currentUxd = synthesisResult.uxd;
    currentPdd = synthesisResult.pdd;

    // 3. Strategist: Determine the next question to ask
    // We pass the full history including the latest user message
    const updatedStringifiedHistory = currentConversationHistory.map(turn => `${turn.role}: ${turn.parts[0].text}`).join('\n');
    
    console.log('\n[AGENT_ROUTE] ==> 3. Calling Strategist (strategicQuestioning)...');
    const strategistInput = {
      prdDocument: currentPrd,
      eddDocument: currentEdd,
      uxdDocument: currentUxd,
      pddDocument: currentPdd,
      schema: masterSchemaString,
      conversationHistory: updatedStringifiedHistory,
    };
    console.log('[AGENT_ROUTE] Strategist Input:', JSON.stringify(strategistInput, null, 2));

    const strategicResult = await strategicQuestioning(strategistInput);
    console.log('[AGENT_ROUTE] <== 3. Strategist Output:', JSON.stringify(strategicResult, null, 2));

    const nextQuestion = strategicResult.nextQuestion;

    // Add agent's question to the history for the next turn
    currentConversationHistory.push({ role: 'model', parts: [{ text: nextQuestion }] });

    const finalResponse = {
      nextQuestion,
      prd: currentPrd,
      edd: currentEdd,
      uxd: currentUxd,
      pdd: currentPdd,
      analystNotes: currentAnalystNotes,
      conversationHistory: currentConversationHistory,
    };
    
    console.log('\n[AGENT_ROUTE] Sending final response to client:', JSON.stringify(finalResponse, null, 2));
    console.log('---AGENT ROUTE END---\n');

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('!!!!!!!!!! ERROR IN AGENT ROUTE !!!!!!!!!!!');
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error Details:', error);
    return NextResponse.json({ error: 'Failed to process agent request.', details: errorMessage }, { status: 500 });
  }
}
