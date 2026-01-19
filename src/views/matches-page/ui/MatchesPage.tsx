import { MatchesOverview } from '@/widgets/matches'

export const MatchesPage = () => {
    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold">Your Matches</h1>
                <p className="text-sm text-muted-foreground">
                    People who liked you back. Start a conversation when you&apos;re ready.
                </p>
            </div>
            <MatchesOverview />
        </div>
    )
}
