import { describe, it, expect } from 'vitest'
import { isEmail, isNonEmpty, validateRequired } from '~/utils/validators'

describe('isEmail', () => {
  it('accepts standard addresses', () => {
    expect(isEmail('foo@bar.com')).toBe(true)
    expect(isEmail('a.b+tag@example.co.uk')).toBe(true)
  })
  it('rejects malformed', () => {
    expect(isEmail('foo')).toBe(false)
    expect(isEmail('foo@')).toBe(false)
    expect(isEmail('@bar.com')).toBe(false)
    expect(isEmail('')).toBe(false)
  })
})

describe('isNonEmpty', () => {
  it('rejects empty and whitespace-only', () => {
    expect(isNonEmpty('')).toBe(false)
    expect(isNonEmpty('   ')).toBe(false)
  })
  it('accepts text with content', () => {
    expect(isNonEmpty('a')).toBe(true)
    expect(isNonEmpty(' x ')).toBe(true)
  })
})

describe('validateRequired', () => {
  it('returns missing keys', () => {
    expect(validateRequired({ name: 'Jan', email: '' }, ['name', 'email'])).toEqual(['email'])
    expect(validateRequired({ name: '', email: '' }, ['name', 'email'])).toEqual(['name', 'email'])
    expect(validateRequired({ name: 'Jan', email: 'a@b.com' }, ['name', 'email'])).toEqual([])
  })
})
