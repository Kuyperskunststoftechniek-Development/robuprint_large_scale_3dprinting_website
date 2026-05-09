export function useOrgJsonLd() {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'RoBuPRINT',
          url: 'https://robuprint.nl',
          parentOrganization: {
            '@type': 'Organization',
            name: 'Kuypers Kunststoftechniek',
          },
          areaServed: ['NL', 'BE', 'DE'],
        }),
      },
    ],
  })
}
