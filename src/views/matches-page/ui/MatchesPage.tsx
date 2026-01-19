import { ArrowUpRight, HeartHandshake } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { MatchesOverview } from '@/widgets/matches'

export const MatchesPage = () => {
    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <Card className="border-primary/10">
                <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            <HeartHandshake className="h-3.5 w-3.5" />
                            Matches hub
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold">Your Matches</h1>
                            <p className="max-w-xl text-sm text-muted-foreground">
                                People who liked you back. Start a conversation when you&apos;re ready.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="w-full md:w-auto" variant="outline">
                        <Link href="/matching">
                            Discover profiles
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <MatchesOverview />
        </div>
    )
}
