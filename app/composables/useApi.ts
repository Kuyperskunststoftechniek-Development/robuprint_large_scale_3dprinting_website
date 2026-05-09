type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${base.replace(/\/$/, '')}${path}`
    const isJson = options.body && !(options.body instanceof FormData) && !(options.body instanceof Blob)
    const res = await fetch(url, {
      method: options.method ?? (options.body ? 'POST' : 'GET'),
      headers: {
        ...(isJson ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
      body: isJson ? JSON.stringify(options.body) : (options.body as BodyInit | null | undefined),
      signal: options.signal,
    })
    const text = await res.text()
    let parsed: unknown = text
    try { parsed = text ? JSON.parse(text) : null } catch { /* keep text */ }
    if (!res.ok) {
      throw new ApiError(`API ${res.status} ${res.statusText}`, res.status, parsed)
    }
    return parsed as T
  }

  return { request }
}
