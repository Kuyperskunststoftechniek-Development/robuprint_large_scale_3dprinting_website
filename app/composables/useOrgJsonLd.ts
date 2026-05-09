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
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Diamantweg 48',
            postalCode: '5527 LC',
            addressLocality: 'Hapert',
            addressRegion: 'Noord-Brabant',
            addressCountry: 'NL',
          },
          telephone: '+31 13 509 66 11',
          vatID: 'NL801225401B01',
          taxID: '18036761',
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
