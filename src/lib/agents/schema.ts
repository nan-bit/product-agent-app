// src/lib/agents/schema.ts

export const masterSchema = {
  // P0: Critical path for a minimum viable product definition.
  P0: {
    product_overview: {
      title: 'Product Overview',
      questions: [
        'What is the core problem you are trying to solve?',
        'Who is the target user for this product?',
        'What is the unique value proposition?',
      ],
    },
    core_features: {
      title: 'Core Features',
      questions: [
        'What are the 3-5 most essential features for the first version?',
        'Describe the primary user workflow from start to finish.',
        'How will users achieve their main goal using these features?',
      ],
    },
    technical_overview: {
        title: 'Technical Overview',
        questions: [
            'What is the proposed technology stack (frontend, backend, database)?',
            'Are there any key integrations with third-party services?',
            'What are the high-level data models or schema?',
        ]
    }
  },
  // P1: Important details for a well-rounded product.
  P1: {
    user_personas: {
      title: 'User Personas',
      questions: [
        'Can you describe a typical user in more detail? (e.g., their job, their technical skills)',
        'What are their primary pain points related to the problem you are solving?',
      ],
    },
    success_metrics: {
      title: 'Success Metrics',
      questions: [
        'How will you measure the success of this product?',
        'What are the key performance indicators (KPIs) to track?',
      ],
    },
    non_functional_requirements: {
        title: 'Non-Functional Requirements',
        questions: [
            'What are the expected performance and scalability requirements?',
            'Are there any specific security or compliance considerations?',
        ]
    }
  },
  // P2: "Nice to have" details that can be fleshed out later.
  P2: {
    future_roadmap: {
      title: 'Future Roadmap',
      questions: [
        'What features are you considering for future versions?',
        'How do you see the product evolving over the next year?',
      ],
    },
    go_to_market: {
      title: 'Go-to-Market Strategy',
      questions: [
        'How will you acquire your first users?',
        'What is the planned pricing or monetization model?',
      ],
    },
  },
};

export const masterSchemaString = JSON.stringify(masterSchema, null, 2);
