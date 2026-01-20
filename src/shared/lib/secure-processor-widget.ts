type SecureProcessorCloseStatus = 'successful' | 'pending' | 'redirected' | 'failed' | 'error' | null

type OpenSecureProcessorWidgetParams = {
    checkoutToken: string
    onClose?: (status: SecureProcessorCloseStatus) => void
    checkoutUrl?: string
    testMode?: boolean
}

const DEFAULT_WIDGET_SRC = 'https://js.secure-processor.com/widget/be_gateway.js'
const DEFAULT_CHECKOUT_URL = 'https://checkout.secure-processor.com'

const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
        if (existing?.dataset.loaded === 'true') {
            resolve()
            return
        }

        if (existing) {
            existing.addEventListener('load', () => resolve())
            existing.addEventListener('error', () => reject(new Error('Failed to load Secure Processor widget.')))
            return
        }

        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.dataset.loaded = 'false'

        script.addEventListener('load', () => {
            script.dataset.loaded = 'true'
            resolve()
        })
        script.addEventListener('error', () => reject(new Error('Failed to load Secure Processor widget.')))

        document.head.appendChild(script)
    })

const resolveWidgetFactory = () => {
    const globalAny = window as unknown as { Begateway?: any; BeGateway?: any }
    return globalAny.BeGateway ?? globalAny.Begateway ?? null
}

const waitForWidgetFactory = (timeoutMs = 6000, intervalMs = 100) =>
    new Promise<any>((resolve, reject) => {
        const startedAt = Date.now()
        const tick = () => {
            const factory = resolveWidgetFactory()
            if (factory) {
                resolve(factory)
                return
            }

            if (Date.now() - startedAt > timeoutMs) {
                reject(new Error('Secure Processor widget cannot be opened. Widget factory not found.'))
                return
            }

            setTimeout(tick, intervalMs)
        }

        tick()
    })

const createWidgetInstance = (widgetFactory: any, options: Record<string, unknown>) => {
    if (typeof widgetFactory !== 'function') {
        throw new Error('Secure Processor widget cannot be opened. Invalid factory.')
    }

    return new widgetFactory(options)
}

export const openSecureProcessorWidget = async ({
    checkoutToken,
    onClose,
    checkoutUrl,
    testMode,
}: OpenSecureProcessorWidgetParams) => {
    if (typeof window === 'undefined') return

    const widgetSrc = process.env.NEXT_PUBLIC_SECURE_PROCESSOR_WIDGET_SRC ?? DEFAULT_WIDGET_SRC
    await loadScript(widgetSrc)

    const widgetFactory = await waitForWidgetFactory()
    const resolvedCheckoutUrl =
        checkoutUrl ?? process.env.NEXT_PUBLIC_SECURE_PROCESSOR_CHECKOUT_URL ?? DEFAULT_CHECKOUT_URL
    const resolvedTestMode = testMode ?? (process.env.NEXT_PUBLIC_SECURE_PROCESSOR_TEST_MODE ?? 'false') === 'true'

    const instance = createWidgetInstance(widgetFactory, {
        checkout_url: resolvedCheckoutUrl,
        fromWebview: true,
        checkout: {
            iframe: true,
            test: resolvedTestMode,
            transaction_type: 'payment',
        },
        token: checkoutToken,
        closeWidget: onClose,
    })

    if (typeof instance?.createWidget === 'function') {
        instance.createWidget()
        return
    }

    if (typeof instance?.open === 'function') {
        instance.open()
        return
    }

    if (typeof instance?.show === 'function') {
        instance.show()
        return
    }

    const availableKeys = instance && typeof instance === 'object' ? Object.keys(instance).join(', ') : 'none'
    throw new Error(`Secure Processor widget cannot be opened. Methods available: ${availableKeys}`)
}

export type { SecureProcessorCloseStatus }
