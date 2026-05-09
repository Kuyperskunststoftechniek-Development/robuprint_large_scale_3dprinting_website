export type ChunkPlan = { index: number; start: number; end: number }

export function planChunks(totalBytes: number, chunkSize: number): ChunkPlan[] {
  if (totalBytes <= 0) throw new Error('Cannot chunk an empty file')
  if (chunkSize <= 0) throw new Error('Chunk size must be positive')
  const out: ChunkPlan[] = []
  let i = 0
  for (let start = 0; start < totalBytes; start += chunkSize) {
    const end = Math.min(start + chunkSize, totalBytes)
    out.push({ index: i++, start, end })
  }
  return out
}
