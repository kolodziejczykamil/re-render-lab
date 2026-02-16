export function StructuredData() {
  const webApplication = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'React Re-render Simulator',
    description: 'Visualize and optimize React component re-renders with static analysis and rule-based simulation',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Static code analysis for React components',
      'Rule-based render simulation',
      'Optimization suggestions',
      'Performance metrics',
      'Interactive render timeline',
    ],
    url: 'https://react-rerender-simulator.com',
  };

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'React Re-render Simulator',
    description: 'Visualize and optimize React component re-renders',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
    },
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
    </>
  );
}
