import type { NextRequest } from 'next/server'

import { HttpError } from '@/shared/http-client'

export const requireCronSecret = (request: NextRequest): void => {
    const secret = process.env.CRON_SECRET
    const header = request.headers.get('authorization')

    if (!secret || header !== `Bearer ${secret}`) {
        throw new HttpError('Unauthorized', 401)
    }
}
