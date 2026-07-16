import { planChunks } from '~/utils/chunker'

export type UploadOptions = {
  url: string
  file: File | Blob
  filename: string
  uploadId: string
  chunkSize: number
  onProgress: (done: number, total: number) => void
  signal?: AbortSignal
  maxAttempts?: number
  retryDelayMs?: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function uploadFileInChunks(opts: UploadOptions): Promise<void> {
  const chunks = planChunks(opts.file.size, opts.chunkSize)
  const maxAttempts = opts.maxAttempts ?? 3
  const retryDelayMs = opts.retryDelayMs ?? 500
  for (const chunk of chunks) {
    const slice = opts.file.slice(chunk.start, chunk.end)
    // Retry transient network failures; the backend accepts an idempotent
    // resend of the last chunk, so a lost response is safe to retry too.
    for (let attempt = 1; ; attempt++) {
      const fd = new FormData()
      fd.append('upload_id', opts.uploadId)
      fd.append('filename', opts.filename)
      fd.append('chunk_index', String(chunk.index))
      fd.append('chunk_total', String(chunks.length))
      fd.append('chunk', slice, opts.filename)
      try {
        const res = await fetch(opts.url, { method: 'POST', body: fd, signal: opts.signal })
        if (!res.ok) {
          throw new UploadHttpError(`Upload failed: chunk ${chunk.index} returned ${res.status} ${res.statusText}`, res.status)
        }
        break
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === 'AbortError'
        const isNetworkError = !(err instanceof UploadHttpError) && !aborted
        if (!isNetworkError || attempt >= maxAttempts) throw err
        await sleep(retryDelayMs * attempt)
      }
    }
    opts.onProgress(chunk.index + 1, chunks.length)
  }
}

export class UploadHttpError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function useChunkedUpload() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  function newUploadId(): string {
    return crypto.randomUUID()
  }

  async function upload(file: File, onProgress: (pct: number) => void, signal?: AbortSignal): Promise<{ uploadId: string; filename: string; size: number }> {
    const uploadId = newUploadId()
    const CHUNK = 5 * 1024 * 1024
    await uploadFileInChunks({
      url: `${base}/quote/upload`,
      file,
      filename: file.name,
      uploadId,
      chunkSize: CHUNK,
      onProgress: (done, total) => onProgress(Math.round((done / total) * 100)),
      signal,
    })
    return { uploadId, filename: file.name, size: file.size }
  }

  return { upload, newUploadId }
}
