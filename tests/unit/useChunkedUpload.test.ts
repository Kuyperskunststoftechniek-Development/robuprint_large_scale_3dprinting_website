import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadFileInChunks } from '~/composables/useChunkedUpload'

const CHUNK = 5 * 1024 * 1024

function makeBlob(size: number): Blob {
  return new Blob([new Uint8Array(size)])
}

describe('uploadFileInChunks', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) })
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('posts the right number of chunks for a small file', async () => {
    const blob = makeBlob(100)
    const onProgress = vi.fn()
    await uploadFileInChunks({
      url: 'https://api.test/quote/upload',
      file: blob as File,
      filename: 'a.stl',
      uploadId: 'u-1',
      chunkSize: CHUNK,
      onProgress,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(onProgress).toHaveBeenCalledWith(1, 1)
  })

  it('posts multiple chunks and reports progress', async () => {
    const blob = makeBlob(CHUNK * 2 + 100)
    const onProgress = vi.fn()
    await uploadFileInChunks({
      url: 'https://api.test/quote/upload',
      file: blob as File,
      filename: 'big.stl',
      uploadId: 'u-2',
      chunkSize: CHUNK,
      onProgress,
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(onProgress).toHaveBeenLastCalledWith(3, 3)
  })

  it('throws on a non-OK response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
    const blob = makeBlob(100)
    await expect(uploadFileInChunks({
      url: 'https://api.test/quote/upload',
      file: blob as File,
      filename: 'a.stl',
      uploadId: 'u-3',
      chunkSize: CHUNK,
      onProgress: () => {},
    })).rejects.toThrow(/upload failed/i)
  })
})
