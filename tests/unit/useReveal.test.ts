import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useReveal } from '~/composables/useReveal'

describe('useReveal', () => {
  let observed: Element[]
  let observerCb: IntersectionObserverCallback | null

  beforeEach(() => {
    observed = []
    observerCb = null

    class MockIO implements Partial<IntersectionObserver> {
      constructor(cb: IntersectionObserverCallback) { observerCb = cb }
      observe(el: Element) { observed.push(el) }
      unobserve = vi.fn()
      disconnect = vi.fn()
    }
    // @ts-expect-error happy-dom doesn't ship IntersectionObserver
    globalThis.IntersectionObserver = MockIO
  })

  it('observes elements with data-reveal-target', () => {
    document.body.innerHTML = `
      <div data-reveal-target id="a"></div>
      <div id="b"></div>
      <div data-reveal-target id="c"></div>
    `
    const { observeAll } = useReveal()
    observeAll(document.body)
    expect(observed.map((el) => (el as HTMLElement).id)).toEqual(['a', 'c'])
  })

  it('sets data-reveal="true" on intersecting element and unobserves it', () => {
    document.body.innerHTML = `<div data-reveal-target id="a"></div>`
    const { observeAll } = useReveal()
    observeAll(document.body)

    const el = document.getElementById('a')!
    expect(el.getAttribute('data-reveal')).toBeNull()

    observerCb!(
      [{ target: el, isIntersecting: true } as IntersectionObserverEntry],
      // @ts-expect-error mock observer
      {},
    )

    expect(el.getAttribute('data-reveal')).toBe('true')
  })

  it('does nothing when an entry is not intersecting', () => {
    document.body.innerHTML = `<div data-reveal-target id="a"></div>`
    const { observeAll } = useReveal()
    observeAll(document.body)
    const el = document.getElementById('a')!

    observerCb!(
      [{ target: el, isIntersecting: false } as IntersectionObserverEntry],
      // @ts-expect-error mock observer
      {},
    )

    expect(el.getAttribute('data-reveal')).toBeNull()
  })
})
