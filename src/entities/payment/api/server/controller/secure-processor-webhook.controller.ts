import { inject, injectable } from 'inversify'
import { NextRequest, NextResponse } from 'next/server'
import { HandlePaymentWebhookUseCase } from '../use-cases/handle-payment-webhook.usecase'

@injectable()
export class SecureProcessorWebhookController {
    constructor(
        @inject(HandlePaymentWebhookUseCase)
        private useCase: HandlePaymentWebhookUseCase,
    ) {}

    async handle(req: NextRequest): Promise<NextResponse> {
        const authorization = req.headers.get('Authorization') ?? req.headers.get('authorization')
        const contentSignature =
            req.headers.get('Content-Signature') ?? req.headers.get('content-signature')
        const rawBody = Buffer.from(await req.arrayBuffer())

        await this.useCase.execute({ rawBody, authorization, contentSignature })

        return NextResponse.json({ received: true })
    }
}
