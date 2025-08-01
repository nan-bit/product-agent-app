export type Message = {
  id: string;
  role: 'user' | 'agent';
  content: string;
};

// Genkit flows expect a specific format for conversation history
export type GenkitConversationHistory = {
  role: 'user' | 'model';
  parts: { text: string }[];
}[];
