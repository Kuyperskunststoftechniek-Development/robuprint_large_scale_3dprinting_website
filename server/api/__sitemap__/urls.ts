import { defineSitemapEventHandler } from '#imports'

// Returns additional dynamic URLs for the sitemap.
// Nuxt Sitemap auto-discovers static page routes; this endpoint is for
// programmatic / CMS-driven URLs (e.g. content collections) that
// can't be statically inferred. Currently returns an empty list.
export default defineSitemapEventHandler(() => {
  return []
})
