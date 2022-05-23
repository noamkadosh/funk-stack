import { validateEmail } from './utils'

test('validateEmail returns false for non-emails', () => {
	// eslint-disable-next-line unicorn/no-null
	expect(validateEmail(null)).toBe(false)
	expect(validateEmail('')).toBe(false)
	expect(validateEmail('not-an-email')).toBe(false)
	expect(validateEmail('n@')).toBe(false)
})

test('validateEmail returns true for emails', () => {
	expect(validateEmail('kody@example.com')).toBe(true)
})
