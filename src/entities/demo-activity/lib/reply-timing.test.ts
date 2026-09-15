import assert from 'node:assert/strict'
import { test } from 'node:test'

import { randomReplyDelayMs } from './reply-timing'

test('randomReplyDelayMs returns the minimum bound when rng returns 0', () => {
    assert.equal(randomReplyDelayMs(() => 0), 30_000)
})

test('randomReplyDelayMs stays within the 30s-5min window for any rng in [0,1)', () => {
    const value = randomReplyDelayMs(() => 0.999999)
    assert.ok(value >= 30_000 && value < 300_000)
})
