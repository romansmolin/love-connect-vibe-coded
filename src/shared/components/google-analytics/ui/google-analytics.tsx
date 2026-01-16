import Script from 'next/script'

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-37FFNP35CS'

type GoogleAnalyticsProps = {
    measurementId?: string
}

export const GoogleAnalytics = ({ measurementId = MEASUREMENT_ID }: GoogleAnalyticsProps) => {
    if (!measurementId) {
        return null
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
            />
            <Script id="ga-gtag-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${measurementId}');
                `}
            </Script>
        </>
    )
}
