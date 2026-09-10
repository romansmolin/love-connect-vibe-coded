'use client'

import { useState } from 'react'

import { CityFilter, type DemoCity, MatchingPanel } from '@/features/matching'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export const MatchingPage = () => {
    const [city, setCity] = useState<DemoCity | undefined>()
    const [poolEnabled, setPoolEnabled] = useState(false)

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
            <CityFilter
                onApply={(nextCity) => {
                    setCity(nextCity)
                    setPoolEnabled(true)
                }}
                onClear={() => {
                    setCity(undefined)
                    setPoolEnabled(false)
                }}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Discover Matches</CardTitle>
                    <CardDescription>Swipe through profiles and see who clicks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MatchingPanel city={city} pool={poolEnabled} />
                </CardContent>
            </Card>
        </div>
    )
}
