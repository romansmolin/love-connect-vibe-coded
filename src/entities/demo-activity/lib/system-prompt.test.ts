import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildSystemPrompt } from './system-prompt'

test('buildSystemPrompt always includes the persona username', () => {
    const prompt = buildSystemPrompt({ username: 'Mila' })
    assert.match(prompt, /Mila/)
})

test('buildSystemPrompt includes age and location when provided', () => {
    const prompt = buildSystemPrompt({ username: 'Mila', age: 27, location: 'Lisbon' })
    assert.match(prompt, /27 years old/)
    assert.match(prompt, /live in Lisbon/)
})

test('buildSystemPrompt omits age/location lines when absent', () => {
    const prompt = buildSystemPrompt({ username: 'Mila' })
    assert.doesNotMatch(prompt, /years old/)
    assert.doesNotMatch(prompt, /live in/)
})

test('buildSystemPrompt tells the model to stay in character and never admit being an AI', () => {
    const prompt = buildSystemPrompt({ username: 'Mila' })
    assert.match(prompt, /never say you are an ai/i)
})
