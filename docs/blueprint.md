# **App Name**: ProductVerse

## Core Features:

- Information Extraction: Analyst: Extracts and maps relevant information from user input to the master schema, identifying any contradictions. Acts as the 'Chief of Staff'.
- Document Generation: Synthesizer: Rewrites the PRD and EDD from scratch on every turn using notes from the Analyst and the full conversation history. The LLM is used as a tool to generate coherent documentation. Functions as the 'Lead Writer'.
- Strategic Questioning: Strategist: Decides the most valuable question to ask next by analyzing the current state of the documents and the schema. Serves as the 'Intelligent Interviewer'.
- Conversational Interface: Facilitator: Presents questions from the Strategist in a clear and friendly manner.
- Responsive UI: Two-panel layout: Features a chat window on one side and a dynamic document viewer on the other.
- Enhanced User Experience: Implements the features of the previous prototype: resizable panels, hide-able document view, iMessage-style chat bubbles, auto-growing text input, dark mode, and copy-to-clipboard functionality.
- API Security: Secure API route: Uses the Next.js API route to handle all external calls to the Gemini API, ensuring API keys remain secure.

## Style Guidelines:

- Primary color: Deep purple (#6750A4) to convey intelligence and innovation.
- Background color: Very light purple (#F2EFF7) for a clean, sophisticated backdrop.
- Accent color: Blue-purple (#526DA1), a less saturated color, to give enough contrast to the primary.
- Body and headline font: 'Inter', a sans-serif font, for clear and modern readability.
- Use minimalist icons that relate to product development and strategy, in the accent color.
- Two-panel layout, resizable. Chat window on the left, document viewer on the right. Document viewer is hide-able.
- Subtle animations to enhance user experience when the document updates or a new question is generated.