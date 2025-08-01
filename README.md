# Product Agent

This is an intelligent, conversational agent that acts as a strategic partner for product ideation.

## Getting Started

First, install the dependencies:
```bash
npm install
```

Next, you'll need to set up your environment variables. Create a `.env` file in the root of the project and add your Google AI API key:

```
GOOGLE_API_KEY=your_google_api_key_here
```

Then, run the development servers. You'll need two terminals.

In the first terminal, run the Next.js development server:

```bash
npm run dev
```

In the second terminal, run the Genkit development server:

```bash
npm run genkit:dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Learn More

This project is a Next.js application that uses Genkit for its AI backend.

To learn more, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Genkit Documentation](https://firebase.google.com/docs/genkit) - learn about Genkit.
