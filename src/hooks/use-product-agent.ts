'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Message, GenkitConversationHistory } from '@/lib/types';

export function useProductAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prd, setPrd] = useState('');
  const [edd, setEdd] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [conversationHistory, setConversationHistory] = useState<GenkitConversationHistory>([]);
  const [analystNotes, setAnalystNotes] = useState('');
  
  const { toast } = useToast();

  const processAgentTurn = useCallback(async (userInput: string | null = null) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          conversationHistory,
          analystNotes,
          prd,
          edd,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if(data.error) {
          throw new Error(data.details || data.error);
      }

      setPrd(data.prd);
      setEdd(data.edd);
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
      console.error('Failed to get response from agent:', error);
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
    }
  }, [conversationHistory, analystNotes, prd, edd, toast]); // Removed messages.length from deps

  // Start conversation on initial load with an opening question
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: "Hello! I'm your AI Product Agent. Tell me about your product idea to get started.", // Your opening question
      }]);
      // We don't call processAgentTurn() here anymore for the initial message
      setIsLoading(false); // Set loading to false after setting initial message
    }
    // No need for exhaustive-deps here as we only run once on mount
  }, []); // Empty dependency array ensures this runs only once on mount

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Add user message to a temporary history for the next API call
    const newHistory = [...conversationHistory, { role: 'user' as const, parts: [{ text: content }] }];
    setConversationHistory(newHistory); // Update conversation history immediately

    await processAgentTurn(content);
  }, [isLoading, processAgentTurn, conversationHistory]);

  return { messages, prd, edd, isLoading, sendMessage };
}
