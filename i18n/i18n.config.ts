import nlCommon from './locales/nl/common.json'
import enCommon from './locales/en/common.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'nl',
  messages: {
    nl: { common: nlCommon },
    en: { common: enCommon },
  },
}))
