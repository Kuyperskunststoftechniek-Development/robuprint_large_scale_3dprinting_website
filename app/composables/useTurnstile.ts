declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement | string, opts: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void }) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback'

let scriptPromise: Promise<void> | null = null

// Rendering twice into the same container makes Turnstile throw, so remember
// the widget id per container and remove the old widget before re-rendering
// (e.g. when the user retries after a failed submit).
const widgetIds = new WeakMap<HTMLElement, string>()

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    window.onloadTurnstileCallback = () => resolve()
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('Turnstile failed to load'))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

export function useTurnstile() {
  const config = useRuntimeConfig()
  const siteKey = config.public.turnstileSiteKey

  async function getToken(container: HTMLElement): Promise<string> {
    if (!siteKey) {
      // Dev mode (no site key configured) — return a fake token; backend should accept "dev-no-turnstile" tokens in dev.
      return 'dev-no-turnstile'
    }
    await loadTurnstileScript()
    return new Promise((resolve, reject) => {
      if (!window.turnstile) return reject(new Error('Turnstile not available'))
      const previous = widgetIds.get(container)
      if (previous !== undefined) {
        try { window.turnstile.remove(previous) } catch { /* already gone */ }
        widgetIds.delete(container)
        container.innerHTML = ''
      }
      try {
        const id = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: (token) => resolve(token),
          'error-callback': () => reject(new Error('Turnstile challenge failed')),
        })
        widgetIds.set(container, id)
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Turnstile render failed'))
      }
    })
  }

  return { getToken }
}
