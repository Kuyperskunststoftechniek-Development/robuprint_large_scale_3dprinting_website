import nlCommon from './locales/nl/common.json'
import nlHome from './locales/nl/home.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'nl',
  messages: {
    nl: { common: nlCommon, home: nlHome },
    en: { common: enCommon, home: enHome },
  },
}))
