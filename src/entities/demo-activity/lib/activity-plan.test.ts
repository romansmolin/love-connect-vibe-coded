import assert from 'node:assert/strict'
import { test } from 'node:test'

import { planSeedActivity } from './activity-plan'

test('seed plan guarantees a visible like for a user without demo activity when random rolls miss', () => {
    assert.deepEqual(planSeedActivity(false, () => false), {
        createLike: true,
        createMutualMatch: false,
    })
})

test('seed plan keeps the configured probabilistic activity for a user who already has activity', () => {
    assert.deepEqual(planSeedActivity(true, () => true), {
        createLike: true,
        createMutualMatch: true,
    })
})
