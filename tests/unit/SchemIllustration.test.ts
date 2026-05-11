import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchemIllustration from '~/components/bento/SchemIllustration.vue'

const NAMES = ['envelope', 'robot-arm', 'layer-stack', 'post-mill', 'recyclate-flow', 'pellet', 'shaft'] as const

describe('SchemIllustration', () => {
  for (const name of NAMES) {
    it(`renders an svg for name="${name}"`, () => {
      const w = mount(SchemIllustration, { props: { name } })
      const svg = w.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('data-schem')).toBe(name)
    })
  }

  it('renders nothing for an unknown name', () => {
    const w = mount(SchemIllustration, { props: { name: 'nope' as never } })
    expect(w.find('svg').exists()).toBe(false)
  })
})
