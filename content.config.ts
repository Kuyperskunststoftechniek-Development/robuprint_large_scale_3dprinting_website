import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      source: 'projecten/*.md',
      schema: z.object({
        title: z.string(),
        client: z.string().optional(),
        material: z.string().optional(),
        year: z.number().optional(),
        cover: z.string().optional(),
        gallery: z.array(z.string()).optional(),
        summary: z.string(),
        locale: z.enum(['nl', 'en']).default('nl'),
      }),
    }),
  },
})
