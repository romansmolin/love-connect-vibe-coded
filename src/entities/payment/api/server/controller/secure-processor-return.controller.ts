import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { HandleReturnUseCase } from '../use-cases/handle-return.usecase'
import { AppError } from '@/shared/errors/app-error'
import { secureProcessorConfig } from '@/shared/config/secure-processor.config'

@injectable()
export class SecureProcessorReturnController {
    constructor(
        @inject(HandleReturnUseCase)
        private useCase: HandleReturnUseCase,
    ) {}

    async handle(req: NextRequest): Promise<NextResponse> {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get('token')
        const statusHint = searchParams.get('status')
        const uidHint = searchParams.get('uid')

        if (!token) {
            return this.failedRedirect(null)
        }

        try {
            const result = await this.useCase.execute({
                paymentTokenId: token,
                statusHint,
                uidHint,
            })
            return NextResponse.redirect(result.redirectUrl)
        } catch (error) {
            console.error('[SecureProcessorReturnController] handle error', error)
            if (error instanceof AppError) {
                return this.failedRedirect(token)
            }
            return this.failedRedirect(token)
        }
    }

    private failedRedirect(token: string | null): NextResponse {
        const params = new URLSearchParams({ status: 'error' })
        if (token) params.set('token', token)
        const url = `${secureProcessorConfig.frontendBaseUrl}/payments/secure-processor/failed?${params.toString()}`
        return NextResponse.redirect(url)
    }
}
