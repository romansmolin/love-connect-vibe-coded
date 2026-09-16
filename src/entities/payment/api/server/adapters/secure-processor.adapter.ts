import 'server-only'
import { injectable } from 'inversify'
import type {
    CreateCheckoutInput,
    CreateCheckoutResult,
    PaymentGatewayAdapter,
    QueryCheckoutResult,
} from '../interfaces/payment-gateway.interface'
import { HttpError } from '@/shared/errors/http-error'
import { secureProcessorConfig } from '@/shared/config/secure-processor.config'

const toSafeErrorPreview = (payload: string): string => {
    const compact = payload.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    return compact.slice(0, 220)
}

@injectable()
export class SecureProcessorAdapter implements PaymentGatewayAdapter {
    async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
        const payload = {
            checkout: {
                version: 2.1,
                transaction_type: 'payment',
                test: input.testMode,
                iframe: true,
                settings: {
                    return_url: input.returnUrl,
                    ...(input.notificationUrl ? { notification_url: input.notificationUrl } : {}),
                    language: 'en',
                },
                order: {
                    amount: input.amountCents,
                    currency: input.currency,
                    description: input.description,
                    tracking_id: input.trackingId,
                },
                customer: {
                    id: input.customerId,
                    ...(input.customerEmail ? { email: input.customerEmail } : {}),
                },
                metadata: input.metadata,
            },
        }

        const configuredUrl = new URL(
            secureProcessorConfig.checkoutTokenPath,
            secureProcessorConfig.apiBaseUrl,
        )
        let response = await this.requestCheckout(configuredUrl, payload)

        if (!response.ok && response.status === 404 && configuredUrl.pathname.endsWith('/checkout')) {
            const fallbackPath = configuredUrl.pathname.replace(/\/checkout$/, '/checkouts')
            const fallbackUrl = new URL(fallbackPath, secureProcessorConfig.apiBaseUrl)
            console.warn('[SecureProcessorAdapter] Checkout path returned 404, retrying fallback path', {
                configuredPath: configuredUrl.pathname,
                fallbackPath: fallbackUrl.pathname,
            })
            response = await this.requestCheckout(fallbackUrl, payload)
        }

        if (!response.ok) {
            const bodyText = await response.text()
            const safePreview = toSafeErrorPreview(bodyText)

            throw new HttpError(
                `Secure Processor checkout failed (${response.status}). ${safePreview || 'Unexpected response from payment gateway.'}`,
                response.status >= 400 && response.status < 500 ? 400 : 502,
            )
        }

        const json = await response.json()
        const checkoutToken = json?.token ?? json?.checkout?.token
        const redirectUrl = json?.checkout?.redirect_url

        if (!checkoutToken) {
            throw new HttpError('Secure Processor did not return a checkout token', 502)
        }

        return {
            checkoutToken,
            redirectUrl,
            rawPayload: json,
        }
    }

    async queryCheckout(gatewayCheckoutToken: string): Promise<QueryCheckoutResult> {
        const url = new URL(
            `/ctp/api/checkouts/${encodeURIComponent(gatewayCheckoutToken)}`,
            secureProcessorConfig.apiBaseUrl,
        )

        let response: Response
        try {
            response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: secureProcessorConfig.authHeader,
                },
            })
        } catch {
            throw new HttpError('Secure Processor reconciliation network error', 502)
        }

        if (!response.ok) {
            const bodyText = await response.text().catch(() => '')
            throw new HttpError(
                `Secure Processor reconciliation failed (${response.status}). ${toSafeErrorPreview(bodyText)}`,
                502,
            )
        }

        const json = await response.json().catch(() => ({}))
        const checkout = json?.checkout ?? json ?? {}
        const order = checkout.order ?? {}
        const gatewayResponse = checkout.gateway_response ?? {}
        const payment = gatewayResponse.payment ?? checkout.payment ?? {}

        const status =
            payment.status ?? checkout.status ?? checkout.state ?? gatewayResponse.status ?? null
        const uid = payment.uid ?? checkout.uid ?? gatewayResponse.uid ?? null
        const amountCents =
            typeof order.amount === 'number'
                ? order.amount
                : typeof checkout.amount === 'number'
                  ? checkout.amount
                  : null
        const currency = order.currency ?? checkout.currency ?? null
        const trackingId = order.tracking_id ?? checkout.tracking_id ?? null
        const testMode = Boolean(
            checkout.test ?? gatewayResponse.test ?? payment.test ?? checkout.settings?.test ?? null,
        )

        return {
            status,
            uid,
            amountCents,
            currency,
            trackingId,
            testMode,
            rawPayload: json,
        }
    }

    private async requestCheckout(url: URL, payload: unknown): Promise<Response> {
        try {
            return await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: secureProcessorConfig.authHeader,
                },
                body: JSON.stringify(payload),
            })
        } catch {
            throw new HttpError('Secure Processor checkout network error', 502)
        }
    }
}

export const isSecureProcessorTestMode = () => secureProcessorConfig.isTestMode
