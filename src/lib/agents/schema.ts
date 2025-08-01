
// This file defines the "question bank" for the workshop.
// It maintains the original structure but refines the questions to be more user-friendly
// and incorporates the principles of Atomic Design for the UXD.

export const masterSchema = {
  prd: {
    title: 'Product Requirements Document (PRD)',
    product_overview: {
      title: '1. Product Overview & Vision',
      questions: [
        "What is the single most important problem you're trying to solve?",
        'Who is the primary audience that will benefit most from this solution?',
        'Thinking long-term, what is the ultimate vision for this project?',
      ],
    },
    core_features: {
      title: '2. Core Features & User Journeys',
      questions: [
        "Describe the single most important task or journey a user will take to solve their core problem.",
        'What are the most essential features needed to make that journey possible?',
        "To help us focus, what's a feature we should intentionally leave out of the first version?",
      ],
    },
    success_metrics: {
      title: '3. Success Metrics',
      questions: [
        'How will you know if this project is a success?',
        'What is the one key metric we should measure for the first version?',
      ],
    },
    future_roadmap: {
      title: '4. Future Roadmap',
      questions: [
        "Looking beyond the first version, what's one thing you'd be excited to add next?",
      ],
    },
  },
  edd: {
    title: 'Engineering Design Document (EDD)',
    technical_overview: {
      title: '1. Technical Overview',
      questions: [
        "In simple terms, how do you envision this being built? (e.g., 'A modern web app', 'a mobile app'?)",
        'Are there any key integrations with other services or APIs we need to consider?',
      ],
    },
    key_considerations: {
      title: '2. Key Considerations',
      questions: [
        'Will users need to create an account and log in?',
        'Are there any specific security or data privacy concerns we need to be aware of?',
        'What kind of information will the app need to remember or save for the user?',
      ],
    },
  },
  uxd: {
    title: 'User Experience Document (UXD) - A Design System Approach',
    design_atoms: {
      title: '1. Core Design Language (Atoms)',
      questions: [
        "Let's start building your design system. What is the personality or brand of your app? (e.g., 'playful', 'serious', 'modern')",
        'Based on that personality, what should the primary brand color be?',
        "And how should the text feel? (e.g., 'like a clean tech blog', 'like a classic newspaper')",
      ],
    },
    design_molecules: {
      title: '2. Key Components (Molecules)',
      questions: [
        "Now let's think about the building blocks of your UI. What are 2-3 of the most common, reusable components you'll need? (e.g., 'a search bar', 'a user profile card')",
      ],
    },
    design_templates: {
      title: '3. Page Layouts (Templates)',
      questions: [
        'How should the main page of the app be laid out? Can you describe the major sections on that page?',
        'What is the most important piece of information or action to present to the user on that main page?',
      ],
    },
  },
};

export const masterSchemaString = JSON.stringify(masterSchema, null, 2);