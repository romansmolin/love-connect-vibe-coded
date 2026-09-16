import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { requireCronSecret } from '../lib/cron-auth'
import { replySchedulerService } from '../services/reply-scheduler.service'
import { seedActivityService } from '../services/seed-activity.service'

const handleError = (error: unknown) => {
    if (error instanceof HttpError) {
        return NextResponse.json({ message: error.message }, { status: error.status ?? 500 })
    }

    console.error('[demo-activity-cron] Unexpected error', error)
    return NextResponse.json({ message: 'Unexpected server error' }, { status: 500 })
}

export const seedActivityRoute = async (request: NextRequest) => {
    try {
        requireCronSecret(request)
        const result = await seedActivityService.run()
        return NextResponse.json(result)
    } catch (error) {
        return handleError(error)
    }
}

export const processRepliesRoute = async (request: NextRequest) => {
    try {
        requireCronSecret(request)
        const processed = await replySchedulerService.processDueReplies(50)
        return NextResponse.json({ processed })
    } catch (error) {
        return handleError(error)
    }
}
