import { Metadata } from 'next'
import { Montserrat } from 'next/font/google'

import { GoogleAnalytics } from '@/shared/components'
import { Toaster } from '@/shared/ui/sonner'

import Header from '../_layout/basic/header'
import RtkProvider from '../_providers/rtk-provider'
import { ThemeProvider } from '../_providers/theme-provider'
import '../globals.css'

export const metadata: Metadata = {
    title: 'Authentication',
    description: 'Authentication',
}

// eslint-disable-next-line unused-imports/no-unused-vars
const montserrat = Montserrat({
    variable: '--montserrat',
    subsets: ['latin'],
    weight: ['400', '500'],
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html suppressHydrationWarning lang="en">
            <body className="antialiased flex h-svh flex-col overflow-hidden">
                <GoogleAnalytics measurementId="G-37FFNP35CS" />
                <RtkProvider>
                    <ThemeProvider disableTransitionOnChange enableSystem attribute="class" defaultTheme="system">
                        <Header isAuth />
                        <main className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto bg-background px-4 py-4">
                            <div className="my-auto w-full max-w-xl">{children}</div>
                        </main>
                        <Toaster richColors />
                    </ThemeProvider>
                </RtkProvider>
            </body>
        </html>
    )
}
