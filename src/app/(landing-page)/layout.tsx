import { Metadata } from 'next'
import { Montserrat, Pacifico } from 'next/font/google'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import { Header } from '@/widgets/header'

import Footer2 from '../_layout/basic/footer2'
import RtkProvider from '../_providers/rtk-provider'
import '../globals.css'

const montserrat = Montserrat({
    variable: '--montserrat',
    subsets: ['latin'],
    weight: ['400', '500'],
})

const pacifico = Pacifico({
    variable: '--pacifico',
    subsets: ['latin'],
    weight: ['400'],
})

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://zapshipr.com').replace(/\/$/, '')
const ogImage = `${siteUrl}/assets/meta.png`

const navigationData = [
    { title: 'Home', href: '/' },
    { title: 'How It Works', href: '#how-it-works' },
    { title: 'Features', href: '#features' },
    { title: 'Success Stories', href: '#testimonials' },
    { title: 'Pricing', href: '#pricing' },
    { title: 'FAQ', href: '#faq' },
]

const headerActions = (
    <>
        <Button asChild className="px-5" variant="ghost">
            <Link href="/auth?tab=sign-in">Sign in</Link>
        </Button>
        <Button asChild className="px-5">
            <Link href="/auth?tab=sign-up">Sign up</Link>
        </Button>
    </>
)

export const metadata: Metadata = {
    title: 'LoveConnect | Find Your Perfect Match',
    description:
        'Discover meaningful connections with our smart matching algorithm. Chat, meet, and build relationships that matter.',
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        type: 'website',
        url: siteUrl,
        siteName: 'LoveConnect',
        title: 'LoveConnect | Find Your Perfect Match',
        description:
            'Discover meaningful connections with our smart matching algorithm. Chat, meet, and build relationships that matter.',
        images: [
            {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: 'LoveConnect dating app preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'LoveConnect | Find Your Perfect Match',
        description:
            'Discover meaningful connections with our smart matching algorithm. Chat, meet, and build relationships that matter.',
        images: [ogImage],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            suppressHydrationWarning
            className={`${montserrat.variable} ${pacifico.variable} overflow-x-hidden`}
            lang="en"
        >
            <body className="antialiased overflow-x-hidden">
                <RtkProvider>
                    <Header actions={headerActions} navigationData={navigationData} variant={4} />
                    <main className="flex flex-col mx-auto -mt-[88px]">{children}</main>
                    <Footer2 />
                </RtkProvider>
            </body>
        </html>
    )
}
