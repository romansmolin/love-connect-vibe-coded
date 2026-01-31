import { ArrowUpRight, HeartHandshake } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import { MatchesOverview } from '@/widgets/matches'

export const MatchesPage = () => {
    return (
        <div className="mx-auto w-full space-y-4">
            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                <aside className="flex flex-col rounded-2xl border border-border/70 bg-background p-4">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            <HeartHandshake className="h-3.5 w-3.5" />
                            Matches hub
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold">Your Matches</h1>
                            <p className="text-sm text-muted-foreground">
                                People who liked you back. Start a conversation when you&apos;re ready.
                            </p>
                        </div>
                    </div>
                    <div className="mt-auto pt-6">
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/matching">
                                Discover profiles
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </aside>

                <section className="rounded-2xl border border-border/70 bg-background p-4">
                    <MatchesOverview />
                </section>
            </div>
        </div>
    )
}
