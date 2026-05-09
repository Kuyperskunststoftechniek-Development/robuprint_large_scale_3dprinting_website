import nlCommon from './locales/nl/common.json'
import nlHome from './locales/nl/home.json'
import nlCapabilities from './locales/nl/capabilities.json'
import nlMaterials from './locales/nl/materials.json'
import nlAbout from './locales/nl/about.json'
import nlProjects from './locales/nl/projects.json'
import nlContact from './locales/nl/contact.json'
import nlQuote from './locales/nl/quote.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enCapabilities from './locales/en/capabilities.json'
import enMaterials from './locales/en/materials.json'
import enAbout from './locales/en/about.json'
import enProjects from './locales/en/projects.json'
import enContact from './locales/en/contact.json'
import enQuote from './locales/en/quote.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'nl',
  messages: {
    nl: { common: nlCommon, home: nlHome, capabilities: nlCapabilities, materials: nlMaterials, about: nlAbout, projects: nlProjects, contact: nlContact, quote: nlQuote },
    en: { common: enCommon, home: enHome, capabilities: enCapabilities, materials: enMaterials, about: enAbout, projects: enProjects, contact: enContact, quote: enQuote },
  },
}))
