import assert from 'node:assert/strict'
import { test } from 'node:test'

import { matchRepo } from '../repositories/match.repo'

import { matchService } from './match.service'

test('default discovery pool makes no more than two upstream requests', async () => {
    const originalDiscover = matchRepo.discover
    let requestCount = 0

    matchRepo.discover = async (_sessionId, params) => {
        requestCount += 1

        return {
            connected: 1,
            nb_pages: 50,
            result: [{ id: Number(params.page) + 1, pseudo: 'Member' }],
        }
    }

    try {
        await matchService.discoverPool('test-session', {}, new Set())
        assert.ok(requestCount <= 2, `expected at most two upstream requests, received ${requestCount}`)
    } finally {
        matchRepo.discover = originalDiscover
    }
})
