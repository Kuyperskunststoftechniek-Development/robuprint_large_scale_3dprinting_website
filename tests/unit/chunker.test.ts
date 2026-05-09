import { describe, it, expect } from 'vitest'
import { planChunks } from '~/utils/chunker'

describe('planChunks', () => {
  const CHUNK = 5 * 1024 * 1024 // 5 MB

  it('returns one chunk for tiny files', () => {
    expect(planChunks(100, CHUNK)).toEqual([{ index: 0, start: 0, end: 100 }])
  })

  it('splits an exact-multiple file', () => {
    const total = CHUNK * 3
    const chunks = planChunks(total, CHUNK)
    expect(chunks).toHaveLength(3)
    expect(chunks[0]).toEqual({ index: 0, start: 0, end: CHUNK })
    expect(chunks[2]).toEqual({ index: 2, start: CHUNK * 2, end: total })
  })

  it('handles a non-multiple file', () => {
    const total = CHUNK * 2 + 100
    const chunks = planChunks(total, CHUNK)
    expect(chunks).toHaveLength(3)
    expect(chunks[2]).toEqual({ index: 2, start: CHUNK * 2, end: total })
  })

  it('rejects zero-size files', () => {
    expect(() => planChunks(0, CHUNK)).toThrow(/empty/i)
  })

  it('rejects non-positive chunk size', () => {
    expect(() => planChunks(100, 0)).toThrow(/chunk size/i)
  })
})
