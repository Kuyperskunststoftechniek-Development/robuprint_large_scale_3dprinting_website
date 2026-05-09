export default defineNuxtConfig({
  compatibilityDate: '2026-05-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/sitemap',
    '@nuxtjs/robots',
  ],
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
      ],
    },
  },
  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en'],
    },
  },
})
