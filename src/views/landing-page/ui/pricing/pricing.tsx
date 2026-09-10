import Link from 'next/link'

import { CREDIT_PACKAGES } from '@/entities/credit'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const PricingSection = () => {
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-14 md:py-20" id="pricing">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Simple pricing</p>
            <h2 className="mt-3 text-center text-4xl font-bold tracking-tight md:text-5xl">
                Buy credits when you need them
            </h2>
            <p className="mt-4 max-w-2xl text-center text-muted-foreground">
                One credit costs €0.10. Use credits for digital gifts and other in-app actions.
            </p>

            <div className="mt-10 grid w-full gap-5 md:grid-cols-3">
                {CREDIT_PACKAGES.map((pack, index) => (
                    <Card key={pack.id} className={index === 1 ? 'border-primary shadow-md' : undefined}>
                        <CardHeader>
                            <CardTitle>{pack.credits} credits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">€{(pack.amountCents / 100).toFixed(2)}</p>
                            <p className="mt-2 text-sm text-muted-foreground">1 credit = €0.10</p>
                            <Button asChild className="mt-6 w-full">
                                <Link href="/auth?tab=sign-up">Get started</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}

export default PricingSection
