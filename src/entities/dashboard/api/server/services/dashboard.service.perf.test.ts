import assert from 'node:assert/strict'
import { test } from 'node:test'

import { userRepo } from '@/entities/user/api/server/repositories/user.repo'
import { userService } from '@/entities/user/api/server/services/user.service'

import { dashboardRepo } from '../repositories/dashboard.repo'

import { dashboardService } from './dashboard.service'

test('recent visitors does not load each visitor profile again', async () => {
    const originalVisitors = dashboardRepo.getRecentVisitors
    const originalProfile = userRepo.getProfile
    let profileRequestCount = 0

    dashboardRepo.getRecentVisitors = async () => ({
        connected: 1,
        result: Array.from({ length: 2 }, (_, index) => ({
            id: index + 1,
            pseudo: `Visitor ${index + 1}`,
            age: 30,
            zone_name: 'Riga',
            photo: `https://example.com/${index + 1}.jpg`,
        })),
    })
    userRepo.getProfile = async () => {
        profileRequestCount += 1
        return { connected: 1, result: undefined }
    }

    try {
        await dashboardService.getRecentVisitors('test-session', {})
        assert.equal(profileRequestCount, 0)
    } finally {
        dashboardRepo.getRecentVisitors = originalVisitors
        userRepo.getProfile = originalProfile
    }
})

test('opening a visitor profile makes one profile request after loading recent visitors', async () => {
    const originalVisitors = dashboardRepo.getRecentVisitors
    const originalProfile = userRepo.getProfile
    let profileRequestCount = 0

    dashboardRepo.getRecentVisitors = async () => ({
        connected: 1,
        result: [{ id: 1, pseudo: 'Visitor', age: 30, zone_name: 'Riga' }],
    })
    userRepo.getProfile = async () => {
        profileRequestCount += 1
        return {
            connected: 1,
            result: { id: 1, pseudo: 'Visitor', age: 30, zone_name: 'Riga' },
        }
    }

    try {
        await dashboardService.getRecentVisitors('test-session', {})
        await userService.getMemberProfile({ sessionId: 'test-session', userId: 1 })
        assert.equal(profileRequestCount, 1)
    } finally {
        dashboardRepo.getRecentVisitors = originalVisitors
        userRepo.getProfile = originalProfile
    }
})
