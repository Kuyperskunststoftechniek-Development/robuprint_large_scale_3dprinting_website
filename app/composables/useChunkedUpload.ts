import { planChunks } from '~/utils/chunker'

export type UploadOptions = {
  url: string
  file: File | Blob
  filename: string
  uploadId: string
  chunkSize: number
  onProgress: (done: number, total: number) => void
  signal?: AbortSignal
}

export async function uploadFileInChunks(opts: UploadOptions): Promise<void> {
  const chunks = planChunks(opts.file.size, opts.chunkSize)
  for (const chunk of chunks) {
    const slice = opts.file.slice(chunk.start, chunk.end)
    const fd = new FormData()
    fd.append('upload_id', opts.uploadId)
    fd.append('filename', opts.filename)
    fd.append('chunk_index', String(chunk.index))
    fd.append('chunk_total', String(chunks.length))
    fd.append('chunk', slice, opts.filename)
    const res = await fetch(opts.url, { method: 'POST', body: fd, signal: opts.signal })
    if (!res.ok) {
      throw new Error(`Upload failed: chunk ${chunk.index} returned ${res.status} ${res.statusText}`)
    }
    opts.onProgress(chunk.index + 1, chunks.length)
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
