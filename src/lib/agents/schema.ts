// src/lib/agents/schema.ts

// This file defines the "question bank" for the workshop. It is structured around the
// "Top 5" most critical sections for each document, with questions tailored for a non-technical user.

export const masterSchema = {
  prd: {
    title: 'Product Requirements Document (PRD)',
    problem_statement: {
      title: '1. Problem Statement (The "Why")',
      questions: [
        "Let's start with the most important thing. What is the single biggest problem you are trying to solve for people?",
        "Why is solving this problem so important, both for the user and for the business?",
      ],
    },
    target_audience: {
      title: '2. Target Audience (The "Who")',
      questions: [
        'Who is the primary group of people that experiences this problem most acutely?',
        "To help picture them, could you describe a typical person from that group?",
      ],
    },
    core_user_journey: {
      title: '3. Core User Journey (The "How")',
      questions: [
        "Imagine a user has just discovered your product. How do they solve their problem with it? Please walk me through the main steps they would take.",
      ],
    },
    key_features: {
      title: '4. Key Features (The "What")',
      questions: [
        'Based on that journey, what are the absolute essential features the first version of the product must have to work?',
        "To keep us focused, what's a feature we should intentionally leave out for now?",
      ],
    },
    success_metrics: {
      title: '5. Success Metrics (The "Did it Work?")',
      questions: [
        "Fast forward to after you've launched. How will you know if the product is a success?",
        "What's the one number you would track to measure that success?",
      ],
    },
  },
  uxd: {
    title: 'User Experience Document (UXD)',
    brand_personality: {
      title: '1. Brand Personality & Vibe (The "Feeling")',
      questions: [
        "Let's talk about the design. What is the overall personality you want the app to have? (e.g., 'playful and fun', 'serious and professional', 'modern and minimalist')",
      ],
    },
    design_atoms: {
      title: '2. Core Design Language (The "Atoms")',
      questions: [
        'Based on that personality, what should the primary brand color be?',
        "How should the text feel? (e.g., 'like a clean tech blog', or 'like a classic newspaper')",
      ],
    },
    design_molecules: {
      title: '3. Key Components (The "Lego Bricks")',
      questions: [
        "What are the 2-3 most important, reusable 'building blocks' of your interface? (e.g., 'a search bar', 'a user profile header', 'a product card')",
      ],
    },
    main_screen_template: {
      title: '4. Main Screen Layout (The "Blueprint")',
      questions: [
        'How should the most important page in the app be laid out?',
        'What is the single most important action you want the user to take on that page?',
      ],
    },
    accessibility: {
      title: '5. Accessibility (For Everyone)',
      questions: [
        'Do we need to consider any special accessibility needs, like support for screen readers or keyboard-only use?',
      ],
    },
  },
  pdd: {
    title: 'Privacy Design Document (PDD)',
    data_collection: {
      title: '1. Data We Need (The "What")',
      questions: [
        "What is the absolute minimum user information you'll need to collect for the app to function?",
        'Will the app automatically generate any data based on user activity, like search history or usage logs?',
      ],
    },
    data_use: {
      title: '2. Why We Need It (The "Why")',
      questions: [
        "In simple terms, why is collecting this data necessary for the user's experience?",
      ],
    },
    user_control: {
      title: '3. User Control (Their Power)',
      questions: [
        'How will you clearly inform users what data you collect?',
        'Will a user be able to easily delete their account and all of their data?',
      ],
    },
    storage_security: {
      title: '4. Our Responsibility',
      questions: [
        'Where will user data be stored?',
        'Who on your team will have access to it?',
      ],
    },
    biggest_risk: {
      title: '5. The Biggest Risk',
      questions: [
        "What is the biggest privacy risk to your users that you are worried about?",
        'What is one thing you can do in your design to help prevent that from happening?',
      ],
    },
  },
  edd: {
    title: 'Engineering Design Document (EDD)',
    system_architecture: {
        title: '1. System Architecture',
        questions: [
            "In simple terms, how do you envision this being built? (e.g., 'a modern web app', 'a mobile app'?)",
        ],
    },
    technology_stack: {
        title: '2. Technology Stack',
        questions: [
            "Are there any specific technologies or frameworks you have a strong preference for?",
        ],
    },
    data_model: {
        title: '3. Data Model & Storage',
        questions: [
            "What is the main type of information the app will need to save?",
        ],
    },
    authentication_security: {
        title: '4. Authentication & Security',
        questions: [
            "Will users need to create an account and log in?",
        ],
    },
    deployment: {
        title: '5. Deployment & Operations',
        questions: [
            "How do you plan to monitor the app's health and performance after it's launched?",
        ],
    },
  },
};

export const masterSchemaString = JSON.stringify(masterSchema, null, 2);