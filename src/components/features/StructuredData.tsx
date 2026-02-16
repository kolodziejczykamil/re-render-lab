export function StructuredData() {
  const webApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'React Re-render Simulator',
    description: 'Free React Re-render Simulator. Analyze why your React component re-renders, detect avoidable renders, and improve performance instantly.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AST-based static code analysis for React components',
      'Rule-based render simulation',
      'Optimization suggestions',
      'Performance metrics',
      'Interactive render timeline',
      'Shareable simulation links',
    ],
    url: 'https://react-rerender-simulator.com',
  };

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'React Re-render Simulator',
    description: 'Free React Re-render Simulator. Analyze why your React component re-renders, detect avoidable renders, and improve performance instantly.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this a real React runtime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, this simulator uses static analysis and rule-based heuristics to predict re-renders. It\'s designed for learning and optimization, not for running actual React code.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate are the simulations?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The simulations are based on well-established React patterns and best practices. While they provide accurate predictions for common scenarios, actual React behavior may vary in edge cases.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use this in production?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This tool is designed for development and learning purposes. Use it to understand React re-render patterns and optimize your components before deploying to production.',
        },
      },
      {
        '@type': 'Question',
        name: 'What makes a render "avoidable"?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A render is considered avoidable if it could be prevented through optimization techniques like React.memo, useCallback, useMemo, or proper dependency management in useEffect hooks.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
