import { Suspense } from 'react'

import { Be_Vietnam_Pro, Pacifico } from 'next/font/google'
import { cookies } from 'next/headers'
import { Toaster } from 'sonner'

import { GoogleAnalytics } from '@/shared/components'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { ErrorDialog } from '@/widgets/error-dialog'

import AppSidebar from '../_layout/dashboard/app-sidebar'
import Header from '../_layout/dashboard/header'
import RtkProvider from '../_providers/rtk-provider'
import { SubscribingFlowProvider } from '../_providers/subscribing-flow-provider'
import { ThemeProvider } from '../_providers/theme-provider'
import '../globals.css'

const beVietnamPro = Be_Vietnam_Pro({
    variable: '--font-vietnam-pro',
    subsets: ['latin'],
    weight: ['400', '500'],
})

const pacifico = Pacifico({
    variable: '--pacifico',
    subsets: ['latin'],
    weight: ['400'],
})

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const cookieStore = await cookies()
    const isSidebarOpened = cookieStore.get('sidebar_state')?.value === 'true'

    return (
        <html suppressHydrationWarning lang="en">
            <body className={`${beVietnamPro.variable} ${pacifico.variable} antialiased bg-card`}>
                <GoogleAnalytics measurementId="G-37FFNP35CS" />
                <RtkProvider>
                    <SubscribingFlowProvider>
                        <ThemeProvider
                            disableTransitionOnChange
                            enableSystem
                            attribute="class"
                            defaultTheme="light"
                        >
                            <SidebarProvider defaultOpen={isSidebarOpened} open={isSidebarOpened}>
                                <AppSidebar />
                                <SidebarInset className="flex-1 flex flex-col max-w-[100vw]">
                                    <Header />
                                    <div className="flex-1">
                                        <div className="w-full overflow-hidden h-full px-2 md:px-6 py-4 space-y-8 flex flex-col">
                                            {children}
                                        </div>
                                    </div>
                                    <Suspense fallback={null}>
                                        <ErrorDialog />
                                    </Suspense>
                                </SidebarInset>
                            </SidebarProvider>
                            <Toaster richColors position="top-right" />
                        </ThemeProvider>
                    </SubscribingFlowProvider>
                </RtkProvider>
            </body>
        </html>
    )
}
