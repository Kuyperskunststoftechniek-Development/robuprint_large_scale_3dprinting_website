import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-05-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],
  site: {
    url: 'https://robuprint.com',
    name: 'RoBuPRINT',
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },
  robots: {
    groups: [
      { userAgent: ['*'], allow: ['/'] },
    ],
    sitemap: ['/sitemap.xml'],
  },
  css: ['~/assets/css/tokens.css'],
  runtimeConfig: {
    turnstileSecretKey: '',
    public: {
      apiBase: '',
      turnstileSiteKey: '',
      siteUrl: '',
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'nl' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0E4644' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  components: [
    { path: '~/components/base', pathPrefix: false },
    { path: '~/components/site', pathPrefix: false },
    { path: '~/components/home', pathPrefix: false },
    { path: '~/components/forms', pathPrefix: false },
    { path: '~/components/bento', pathPrefix: false },
  ],
  i18n: {
    vueI18n: './i18n.config.ts',
    defaultLocale: 'nl',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'nl', language: 'nl-NL', name: 'Nederlands' },
      { code: 'en', language: 'en-GB', name: 'English' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'robuprint_locale',
      redirectOn: 'root',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en'],
    },
  },
})
