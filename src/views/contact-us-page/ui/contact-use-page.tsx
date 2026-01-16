import React from 'react'

// eslint-disable-next-line boundaries/element-types
import RtkProvider from '@/app/_providers/rtk-provider'
import { ContactForm } from '@/features/support/contact-us'

export const ContactUsPage = () => {
    return (
        <div className="mt-28 min-h-screen">
            <main className="px-4 py-12 md:px-8">
                <div className="mx-auto max-w-4xl">
                    <RtkProvider>
                        <ContactForm />
                    </RtkProvider>
                </div>
            </main>
        </div>
    )
}
