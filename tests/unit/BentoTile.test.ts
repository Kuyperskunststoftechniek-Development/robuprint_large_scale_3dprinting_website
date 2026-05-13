import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BentoTile from '~/components/bento/BentoTile.vue'

describe('BentoTile', () => {
  it('renders as <div> by default', () => {
    const w = mount(BentoTile, { slots: { default: 'Hi' } })
    expect(w.element.tagName).toBe('DIV')
    expect(w.text()).toContain('Hi')
  })

  it('renders as a link when "to" is given', () => {
    const w = mount(BentoTile, {
      props: { to: '/projecten' },
      slots: { default: 'Hi' },
      global: { stubs: { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
    })
    expect(w.find('a').exists()).toBe(true)
    expect(w.find('a').attributes('href')).toBe('/projecten')
  })

  it('applies the muted variant class', () => {
    const w = mount(BentoTile, { props: { variant: 'muted' } })
    expect(w.attributes('data-variant')).toBe('muted')
  })

  it('applies the accent variant class', () => {
    const w = mount(BentoTile, { props: { variant: 'accent' } })
    expect(w.attributes('data-variant')).toBe('accent')
  })

  it('exposes data-reveal-target by default', () => {
    const w = mount(BentoTile)
    expect(w.attributes('data-reveal-target')).toBe('')
  })

  it('renders the eyebrow when given', () => {
    const w = mount(BentoTile, { props: { eyebrow: 'Materialen' } })
    expect(w.text()).toContain('Materialen')
  })
})
