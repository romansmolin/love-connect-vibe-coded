import { NextResponse } from 'next/server'

import { fetchTopMembers } from '../server/dashboard.service'

import { JetsetRdvError } from '@/shared/api/jetsetrdv/fetch-jetsetrdv'

const handleError = (error: unknown) => {
    if (error instanceof JetsetRdvError) {
        return NextResponse.json({ ok: false, message: error.message }, { status: error.status })
    }

    return NextResponse.json({ ok: false, message: 'Unable to load top members.' }, { status: 502 })
}

export const GET = async (request: Request) => {
    const url = new URL(request.url)
    const genderParam = (url.searchParams.get('gender') ?? 'men').toLowerCase()
    const pageParam = url.searchParams.get('page')

    const gender = genderParam === 'women' ? 'women' : 'men'
    const page = pageParam ? Number(pageParam) || 0 : 0

    try {
        const result = await fetchTopMembers(gender, page)
        return NextResponse.json(result, { status: 200 })
    } catch (error) {
        return handleError(error)
    }
}
