import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { HttpError } from '@/shared/http-client'

import { chatController } from '../controllers/chat.controller'

const handleError = (error: unknown) => {
    if (error instanceof HttpError) {
        return NextResponse.json({ message: error.message, data: error.data }, { status: error.status ?? 500 })
    }
    console.error('[chat-route] Unexpected error', error)
    return NextResponse.json({ message: 'Unexpected server error' }, { status: 500 })
}

export const contactsRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }
    try {
        const response = await chatController.contacts(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const messagesRoute = async (request: NextRequest) => {
    if (request.method !== 'GET') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }
    try {
        const response = await chatController.messages(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}

export const sendRoute = async (request: NextRequest) => {
    if (request.method !== 'POST') {
        return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 })
    }
    try {
        const response = await chatController.send(request)
        return NextResponse.json(response)
    } catch (error) {
        return handleError(error)
    }
}
