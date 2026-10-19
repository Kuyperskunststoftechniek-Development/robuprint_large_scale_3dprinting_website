const SITE_URL = 'https://robuprint.com'

interface PageSeo { title: string; description: string }

// Eigen title, description, canonical en Open Graph-tags per pagina.
// Geef een sleutel uit i18n `seo.*` of een eigen { title, description }.
export function usePageSeo(input: string | PageSeo) {
  const { t, locale } = useI18n()
  const route = useRoute()

  const { title, description } = typeof input === 'string'
    ? { title: t(`seo.${input}.title`), description: t(`seo.${input}.description`) }
    : input

  const path = route.path.replace(/\/+$/, '') || '/'
  const url = `${SITE_URL}${path}`

  useHead({
    title,
    link: [{ rel: 'canonical', href: url }],
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image:alt', content: t('seo.og_image_alt') },
      { property: 'og:locale', content: locale.value === 'nl' ? 'nl_NL' : 'en_GB' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
  })
}
