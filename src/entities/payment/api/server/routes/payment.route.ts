import { NextRequest } from 'next/server'
import { asyncHandler } from '@/shared/http/async-handler'
import { container } from '@/shared/lib/di/container.server'
import { SecureProcessorReturnController } from '../controller/secure-processor-return.controller'
import { SecureProcessorWebhookController } from '../controller/secure-processor-webhook.controller'

const getReturnController = (): SecureProcessorReturnController => {
    return container.get(SecureProcessorReturnController)
}

const getWebhookController = (): SecureProcessorWebhookController => {
    return container.get(SecureProcessorWebhookController)
}

export const GET_SECURE_PROCESSOR_RETURN = asyncHandler(async (request: NextRequest) => {
    return getReturnController().handle(request)
})

export const POST_SECURE_PROCESSOR_WEBHOOK = asyncHandler(async (request: NextRequest) => {
    return getWebhookController().handle(request)
})
