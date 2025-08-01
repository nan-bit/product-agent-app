
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Message, GenkitConversationHistory } from '@/lib/types';

export function useProductAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prd, setPrd] = useState('');
  const [edd, setEdd] = useState('');
  const [uxd, setUxd] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [conversationHistory, setConversationHistory] = useState<GenkitConversationHistory>([]);
  const [analystNotes, setAnalystNotes] = useState('');
  
  const { toast } = useToast();

  const processAgentTurn = useCallback(async (userInput: string | null = null) => {
    setIsLoading(true);
    console.log(`%c[AGENT_HOOK] ==> Sending request to /api/agent`, 'color: blue; font-weight: bold;', { userInput: userInput ?? '(initial)' });

    try {
      const requestBody = {
        userInput,
        conversationHistory,
        analystNotes,
        prd,
        edd,
        uxd,
      };
      
      console.log('[AGENT_HOOK] Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log('%c[AGENT_HOOK] <== Received response from /api/agent', 'color: green; font-weight: bold;');
      console.log('[AGENT_HOOK] Response Data:', JSON.stringify(data, null, 2));
      
      if(data.error) {
          throw new Error(data.details || data.error);
      }

      setPrd(data.prd);
      setEdd(data.edd);
      setUxd(data.uxd);
      setAnalystNotes(data.analystNotes);
      setConversationHistory(data.conversationHistory);

      // This part will now only add agent responses *after* the initial message
      if (data.nextQuestion) {
         setMessages(prev => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            role: 'agent',
            content: data.nextQuestion,
          },
        ]);
      }

    } catch (error) {
      console.error('%c[AGENT_HOOK] !!! Error processing agent turn', 'color: red; font-weight: bold;', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `There was a problem communicating with the agent. ${errorMessage}`,
      });
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'agent',
          content: "Sorry, I've run into a problem. Please try refreshing the page.",
        },
      ]);
    } finally {
      setIsLoading(false);
      console.log('[AGENT_HOOK] Finished processing turn.');
    }
  }, [conversationHistory, analystNotes, prd, edd, uxd, toast]); 

  // Start conversation on initial load with an opening question
  useEffect(() => {
    // This effect runs only once on mount
    if (messages.length === 0) {
      console.log('[AGENT_HOOK] Initializing conversation.');
      setMessages([{
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: "Hello! I'm your AI Product Agent. Tell me about your product idea to get started.",
      }]);
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    console.log('[AGENT_HOOK] Preparing to send user message.');
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Immediately call the agent turn with the new user input
    // We update the conversation history state right before the call in processAgentTurn
    // to ensure it's as fresh as possible.
    
    // Create a temporary history for the API call to avoid state update delays
    const tempHistory = [...conversationHistory, { role: 'user' as const, parts: [{ text: content }] }];
    
    // Use a temporary variable for the request body to ensure we are sending the latest data
    const requestBody = {
        userInput: content,
        conversationHistory: tempHistory,
        analystNotes,
        prd,
        edd,
        uxd,
    };

    setIsLoading(true);
    console.log(`%c[AGENT_HOOK] ==> Sending request to /api/agent for user message`, 'color: blue; font-weight: bold;');
    console.log('[AGENT_HOOK] Request Body:', JSON.stringify(requestBody, null, 2));


    try {
        const response = await fetch('/api/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        console.log('%c[AGENT_HOOK] <== Received response from /api/agent', 'color: green; font-weight: bold;');
        console.log('[AGENT_HOOK] Response Data:', JSON.stringify(data, null, 2));

        if (data.error) {
            throw new Error(data.details || data.error);
        }

        setPrd(data.prd);
        setEdd(data.edd);
        setUxd(data.uxd);
        setAnalystNotes(data.analystNotes);
        setConversationHistory(data.conversationHistory);

        if (data.nextQuestion) {
            setMessages(prev => [
                ...prev,
                { id: `agent-${Date.now()}`, role: 'agent', content: data.nextQuestion },
            ]);
        }
    } catch (error) {
        console.error('%c[AGENT_HOOK] !!! Error sending message', 'color: red; font-weight: bold;', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Could not send message. ${errorMessage}`,
        });
    } finally {
        setIsLoading(false);
        console.log('[AGENT_HOOK] Finished processing message.');
    }

  }, [isLoading, conversationHistory, analystNotes, prd, edd, uxd, toast]);

  return { messages, prd, edd, uxd, isLoading, sendMessage };
}
