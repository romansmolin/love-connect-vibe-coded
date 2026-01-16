import React, { JSX } from 'react'

import { SignUpForm } from '@/features/auth'
import { Card } from '@/shared/ui/card'

const SignUpFormSection = ({ thirdPartyAuth }: { thirdPartyAuth?: JSX.Element }) => {
    return (
        <section className="py-12 md:py-16">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 sm:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to Find Your Perfect Match?
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                        Join 35.0K+ singles who trust Lavrilo to find meaningful relationships
                    </p>
                </div>

                <Card className="bg-background/95 shadow-lg">
                    <SignUpForm thirdPartyAuth={thirdPartyAuth} />
                </Card>
            </div>
        </section>
    )
}

export default SignUpFormSection
