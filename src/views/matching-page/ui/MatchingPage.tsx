'use client'

import { useState } from 'react'

import { type MatchGender, MatchFilters, MatchingPanel } from '@/features/matching'

export const MatchingPage = () => {
    const [city, setCity] = useState<string | undefined>()
    const [gender, setGender] = useState<MatchGender | undefined>()
    const [poolEnabled, setPoolEnabled] = useState(false)

    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <MatchFilters
                onApply={(filters) => {
                    setCity(filters.city)
                    setGender(filters.gender)
                    setPoolEnabled(Boolean(filters.city))
                }}
                onClear={() => {
                    setCity(undefined)
                    setGender(undefined)
                    setPoolEnabled(false)
                }}
            />
            <MatchingPanel city={city} gender={gender} pool={poolEnabled} />
        </div>
    )
}
