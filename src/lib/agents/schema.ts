
// src/lib/agents/schema.ts

export const masterSchema = {
  prd: {
    title: 'Product Requirements Document (PRD)',
    product_overview: {
      title: 'Product Overview',
      questions: [
        'What is the core problem you are trying to solve?',
        'Who is the primary target audience?',
        'What makes this product unique compared to alternatives?',
      ],
    },
    core_features: {
      title: 'Core Features & Functionality',
      questions: [
        'What are the 3-5 most essential features for the first version?',
        'What does a user need to be able to do to solve the core problem?',
      ],
    },
    success_metrics: {
      title: 'Success Metrics',
      questions: [
        'How will you measure the success of this product?',
        'What are the key performance indicators (KPIs) to track?',
      ],
    },
    future_roadmap: {
      title: 'Future Roadmap',
      questions: [
        'What features are you considering for future versions after the initial launch?',
        'How do you see the product evolving over the next year?',
      ],
    },
  },
  edd: {
    title: 'Engineering Design Document (EDD)',
    technical_overview: {
      title: 'Technical Overview',
      questions: [
        'What is the proposed technology stack (frontend, backend, database)?',
        'Are there any key integrations with third-party services or APIs?',
        'What are the high-level data models or schema?',
      ],
    },
    system_architecture: {
      title: 'System Architecture',
      questions: [
        'Can you describe the high-level system architecture? (e.g., monolith, microservices)',
        'What are the major components and how do they interact?',
      ],
    },
    non_functional_requirements: {
      title: 'Non-Functional Requirements',
      questions: [
        'What are the expected performance and scalability needs?',
        'Are there any specific security or data privacy considerations?',
        'How will the application be deployed and monitored?',
      ],
    },
  },
  uxd: {
    title: 'User Experience Document (UXD)',
    look_and_feel: {
      title: 'Look & Feel',
      questions: [
        'What is the desired aesthetic for the app? (e.g., modern, playful, corporate)',
        'Are there any other apps or websites that have a similar style you admire?',
        'Describe the ideal color palette and typography.',
      ],
    },
    user_personas: {
      title: 'User Personas',
      questions: [
        'Can you describe a typical user in more detail? (e.g., their job, goals, tech-savviness)',
        'What are their primary frustrations with existing solutions?',
      ],
    },
    user_journeys: {
      title: 'User Journeys',
      questions: [
        'Describe the primary user workflow from discovering the app to achieving their main goal.',
        'What is the onboarding experience like for a new user?',
        'Are there any key secondary user flows we should consider?',
      ],
    },
  },
};

export const masterSchemaString = JSON.stringify(masterSchema, null, 2);
