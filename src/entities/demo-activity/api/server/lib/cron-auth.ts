import { timingSafeEqual } from 'node:crypto'

import type { NextRequest } from 'next/server'

import { HttpError } from '@/shared/http-client'

const equals = (a: string, b: string): boolean => {
    const left = Buffer.from(a)
    const right = Buffer.from(b)

    return left.length === right.length && timingSafeEqual(left, right)
}

export const requireCronSecret = (request: NextRequest): void => {
    const secret = process.env.CRON_SECRET
    const header = request.headers.get('authorization')

    if (!secret || !header || !equals(header, `Bearer ${secret}`)) {
        throw new HttpError('Unauthorized', 401)
    }
}
