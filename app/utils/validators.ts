const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value)
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0
}

export function validateRequired<T extends Record<string, string>>(
  data: T,
  keys: Array<keyof T>,
): Array<keyof T> {
  return keys.filter((k) => !isNonEmpty(String(data[k] ?? '')))
}
