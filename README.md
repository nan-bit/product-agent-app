# Product Agent

An intelligent, conversational planning system that turns ideas into professional specifications.

The Product Agent acts as an expert interviewer—covering Product, Design, Privacy, and Engineering—to guide you through a focused dialogue. As you chat, it autonomously synthesizes your inputs into a live set of structured documents:

-   **Product Requirements Document (PRD)**
-   **User Experience Document (UXD)** (Atomic Design)
-   **Privacy Design Document (PDD)**
-   **Engineering Design Document (EDD)**

## Architecture

The system uses a multi-agent architecture orchestrated by **Google Genkit**:

1.  **The Analyst:** Extracts facts and detects contradictions from user input.
2.  **The Synthesizer:** Updates the four living documents with new information.
3.  **The Strategist:** Analyzes the current state to ask the single most effective next question.

## Tech Stack

-   **Framework:** Next.js 15 (App Router)
-   **Language:** TypeScript
-   **AI:** Google Genkit + Gemini Models
-   **UI:** React, Tailwind CSS, Radix UI

## Getting Started

### Prerequisites

-   Node.js & `npm`
-   A Google Gemini API Key

### Installation

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/nan-bit/product-agent-app.git
    cd product-agent-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root:
    ```env
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Run:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## License

MIT
