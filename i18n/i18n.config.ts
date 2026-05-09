import nlCommon from './locales/nl/common.json'
import nlHome from './locales/nl/home.json'
import nlCapabilities from './locales/nl/capabilities.json'
import nlMaterials from './locales/nl/materials.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enCapabilities from './locales/en/capabilities.json'
import enMaterials from './locales/en/materials.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'nl',
  messages: {
    nl: { common: nlCommon, home: nlHome, capabilities: nlCapabilities, materials: nlMaterials },
    en: { common: enCommon, home: enHome, capabilities: enCapabilities, materials: enMaterials },
  },
}))
