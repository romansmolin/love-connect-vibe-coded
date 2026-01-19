import { MatchingPanel } from '@/features/matching'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export const MatchingPage = () => {
    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Discover Matches</CardTitle>
                    <CardDescription>Swipe through profiles and see who clicks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MatchingPanel />
                </CardContent>
            </Card>
        </div>
    )
}
