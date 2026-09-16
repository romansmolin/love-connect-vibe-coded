import assert from 'node:assert/strict'
import { test } from 'node:test'

import { rollProbability } from './seed-roll'

test('rollProbability returns true when rng is below the rate', () => {
    assert.equal(
        rollProbability(0.4, () => 0.1),
        true
    )
})

test('rollProbability returns false when rng is at or above the rate', () => {
    assert.equal(
        rollProbability(0.4, () => 0.4),
        false
    )
})
