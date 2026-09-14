import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { userController } from '../controllers/user.controller'

const handleError = (error: unknown) => {
    if (error instanceof HttpError) {
        return NextResponse.json(
            {
                message: error.message,
                data: error.data,
            },
            {
                status: error.status ?? 500,
            }
        )
    }

    console.error('[user-profile-route] Unexpected error', error)

    return NextResponse.json(
        {
            message: 'Unexpected server error',
        },
        { status: 500 }
    )
}

export const profileRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await userController.getProfile(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const memberProfileRoute = async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const { id } = await context.params
        const response = await userController.getMemberProfile(request, Number(id))
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const uploadPhotoRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await userController.uploadPhoto(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const updateProfileRoute = async (request: NextRequest) => {
    if (request.method !== 'PATCH') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }

    try {
        const response = await userController.updateProfile(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}
