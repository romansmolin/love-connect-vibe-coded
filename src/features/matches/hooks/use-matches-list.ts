'use client'

import { useMemo } from 'react'

import type { MatchCandidate } from '@/entities/match'
import { useGetMatchesQuery } from '@/entities/match'
import type { UserPreview } from '@/entities/user'

const mapToPreview = (candidate: MatchCandidate): UserPreview => ({
    id: candidate.id,
    username: candidate.username,
    age: candidate.age,
    location: candidate.location,
    avatarUrl: candidate.photoUrl,
})

export const useMatchesList = () => {
    const { data, isLoading, isFetching, error, refetch } = useGetMatchesQuery()

    const items = data?.items ?? []
    const users = useMemo(() => items.map(mapToPreview), [items])

    return {
        users,
        total: data?.total ?? items.length,
        isLoading: isLoading || isFetching,
        error,
        refetch,
    }
}

export type UseMatchesListReturn = ReturnType<typeof useMatchesList>
