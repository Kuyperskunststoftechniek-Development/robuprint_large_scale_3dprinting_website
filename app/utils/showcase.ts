export type ShowcaseCategory = 'rollers' | 'infra' | 'furniture'

export interface ShowcaseItem {
  /** Sleutel voor de bijschriften in i18n `home.gallery.items.<key>` */
  key: string
  src: string
  category: ShowcaseCategory
}

// Slug van de bijbehorende case op /projecten (content/projecten/<slug>.md)
export const showcaseProjectSlug: Record<ShowcaseCategory, string> = {
  rollers: 'food-rollers',
  infra: 'infra-verlopen',
  furniture: 'meubilair',
}

export const showcaseItems: ShowcaseItem[] = [
  { key: 'roller_dimples', src: '/content/food-rollers/roller-2.png', category: 'rollers' },
  { key: 'roller_grooved', src: '/content/food-rollers/roller-3.png', category: 'rollers' },
  { key: 'roller_spiral', src: '/content/food-rollers/roller-1.png', category: 'rollers' },
  { key: 'reducer', src: '/content/infra/reducer-1.png', category: 'infra' },
  { key: 'reducer_flange', src: '/content/infra/reducer-2.png', category: 'infra' },
  { key: 'planter', src: '/content/furniture/furniture-1.png', category: 'furniture' },
  { key: 'chair', src: '/content/furniture/furniture-2.png', category: 'furniture' },
  { key: 'vase', src: '/content/furniture/furniture-3.png', category: 'furniture' },
]

export function showcaseItem(key: string): ShowcaseItem {
  const item = showcaseItems.find(i => i.key === key)
  if (!item) throw new Error(`Onbekend showcase-item: ${key}`)
  return item
}
