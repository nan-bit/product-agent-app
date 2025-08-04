# Product Agent - An Intelligent Planning System

This project provides an intelligent agent that turns any idea into a complete, professional plan. More than just a chatbot, it acts as an expert interviewer for your product, design, and engineering needs, guiding you through a focused, one-question-at-a-time dialogue. The system synthesizes every piece of information into a continuously updated set of planning documents: a Product Requirements Document (PRD), a User Experience Document (UXD), and an Engineering Design Document (EDD). This ensures that at any point, you have a coherent and actionable plan ready to go.

The application is built on a modern, secure Next.js foundation and leverages an advanced **multi-agent architecture** orchestrated by Google's Genkit. This allows for a dynamic, intelligent, and non-repetitive conversation that feels less like a script and more like a real product planning workshop.

## Key Features

*   **Advanced "Agency of Specialists" AI Architecture:**
    *   **The Analyst (`extract-information.ts`):** The "Chief of Staff" that analyzes every user message to extract all relevant information and detect contradictions.
    *   **The Synthesizer (`synthesize-documents.ts`):** The "Lead Writer" that intelligently updates the PRD, UXD, and EDD with new information on every turn, ensuring the documents are always in their most complete state.
    *   **The Strategist (`strategic-questioning.ts`):** The "Intelligent Interviewer" that analyzes the current state of all three documents to make a strategic decision about the single most valuable question to ask next.

*   **Schema-Driven Conversation (`schema.ts`):**
    *   The entire discovery process is guided by a central "question bank" that defines all possible topics, ensuring a comprehensive plan.
    *   The UXD portion is explicitly structured around the principles of **Atomic Design**, guiding the user to define a complete design system from "Atoms" (colors, fonts) to "Molecules" (components) to "Templates" (page layouts).

*   **Professional & Secure by Default:**
    *   The entire agentic workflow is handled by a secure Next.js API route (`/api/agent`), ensuring that the Google AI API key is **never exposed** to the user's browser.
    *   The frontend is built with modern React hooks (`use-product-agent.ts`) for clean state management, loading states, and error handling with toast notifications.

## How It Works: The Agentic Loop

The application's intelligence comes from a sequential chain of agents, orchestrated by Mission Control (`route.ts`) on every conversational turn.

1.  **User Input:** The user sends a message from the client-side UI.
2.  **Mission Control (`route.ts`):** The Next.js API route receives the user's input, the current conversation history, and the state of the documents.
3.  **The Analyst:** Mission Control first calls the `extract-information` flow. The Analyst reviews the user's latest message and returns a concise summary of the key new information.
4.  **The Synthesizer:** The Analyst's notes are then passed to the `synthesize-documents` flow. The Synthesizer takes this new information and intelligently integrates it into the correct sections of the existing PRD, EDD, and UXD, returning the updated versions.
5.  **The Strategist:** The newly updated documents, along with the conversation history and the master schema, are passed to the `strategic-questioning` flow. The Strategist analyzes everything to identify the most critical knowledge gap and formulates the single best question to ask next.
6.  **Response:** The Strategist's question and the updated documents are sent back to the UI, which then displays the new message and re-renders the artifacts.

## Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Handles both frontend rendering and secure backend logic. |
| **Language** | TypeScript | Ensures type safety and robust code across the application. |
| **AI Orchestration** | Google's Genkit | Defines the AI "flows" for each agent specialist. |
| **AI Model** | Google Gemini | Powers the reasoning for all intelligent agents. |
| **Styling** | Tailwind CSS | For modern, utility-first styling. |
| **UI** | React (Hooks) | Manages all client-side state and user interactions. |

## Getting Started

### Prerequisites
*   Node.js and `yarn` installed.
*   A Google Cloud project with the Vertex AI API enabled.
*   A Gemini API Key.

### 1. Clone the Repository
```bash
git clone https://github.com/nan-bit/product-agent-app.git
cd product-agent-app```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Set Up Environment Variables
Create a new file named `.env` in the root of the project. This file is included in `.gitignore` and will not be committed to source control. Add your secret API key to this file:
```env
# .env
GOOGLE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

### 4. Run the Development Server
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## File Structure Overview

The project is organized into a clean, professional structure:
```
/
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   ├── extract-information.ts     # The Analyst's "brain" and logic.
│   │   │   ├── strategic-questioning.ts   # The Strategist's "brain" and logic.
│   │   │   └── synthesize-documents.ts  # The Synthesizer's "brain" and logic.
│   │   └── genkit.ts                      # Genkit AI plugin configuration.
│   │
│   ├── app/
│   │   ├── api/agent/
│   │   │   └── route.ts                   # Mission Control: The core backend API endpoint.
│   │   ├── layout.tsx                     # Main application layout.
│   │   └── page.tsx                       # The main page component for the UI.
│   │
│   ├── components/                        # Reusable React components for the UI.
│   ├── hooks/
│   │   └── use-product-agent.ts           # The primary React hook for managing all frontend state.
│   │
│   └── lib/
│       ├── agents/
│       │   └── schema.ts                  # The Master Playbook: The central "question bank" for the workshop.
│       ├── types.ts                       # TypeScript type definitions.
│       └── utils.ts                       # Utility functions.
│
├── .env                                   # Your secret API key (ignored by Git).
└── README.md                              # You are here!
```