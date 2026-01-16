import assert from 'node:assert/strict'
import { test } from 'node:test'

import { signInSchema, signUpSchema } from './auth.dto'

const formatDate = (date: Date) => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

test('signUpSchema accepts a valid payload', () => {
    const parsed = signUpSchema.safeParse({
        name: 'Jamie Doe',
        email: 'jamie@example.com',
        password: 'secure-password',
        username: 'jamie',
        gender: 'non_binary',
        lookingFor: 'women',
        dateOfBirth: '1995-05-05',
        city: 'Berlin',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
        assert.ok(parsed.data.dateOfBirth instanceof Date)
    }
})

test('signUpSchema rejects users younger than 18', () => {
    const underageDate = new Date()
    underageDate.setUTCFullYear(underageDate.getUTCFullYear() - 10)

    const parsed = signUpSchema.safeParse({
        name: 'Alex Doe',
        email: 'alex@example.com',
        password: 'secure-password',
        username: 'alex',
        gender: 'man',
        lookingFor: 'man',
        dateOfBirth: formatDate(underageDate),
        city: 'Paris',
    })

    assert.equal(parsed.success, false)
})

test('signInSchema defaults rememberMe to false', () => {
    const parsed = signInSchema.safeParse({
        username: 'jamie',
        password: 'secure-password',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
        assert.equal(parsed.data.rememberMe, false)
    }
})
