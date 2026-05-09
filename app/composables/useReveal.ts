export function useReveal() {
  let observer: IntersectionObserver | null = null

  function ensure() {
    if (observer) return observer
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          ;(entry.target as HTMLElement).setAttribute('data-reveal', 'true')
          observer!.unobserve(entry.target)
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 })
    return observer
  }

  function observeAll(root: ParentNode = document) {
    const obs = ensure()
    root.querySelectorAll('[data-reveal-target]').forEach((el) => obs.observe(el))
  }

  return { observeAll }
}
