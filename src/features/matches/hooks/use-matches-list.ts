'use client'

import { useMemo } from 'react'

import type { MatchCandidate } from '@/entities/match'
import { useGetMatchesQuery, useGetPendingLikesQuery, useGetVotersQuery } from '@/entities/match'
import type { UserPreview } from '@/entities/user'

const mapToPreview = (candidate: MatchCandidate): UserPreview => ({
    id: candidate.id,
    username: candidate.username,
    age: candidate.age,
    location: candidate.location,
    avatarUrl: candidate.photoUrl,
})

export const useMatchesList = (includeLiked = false) => {
    const { data, isLoading, isFetching, error, refetch } = useGetMatchesQuery()
    const {
        data: pendingData,
        isLoading: isPendingLoading,
        isFetching: isPendingFetching,
        error: pendingError,
        refetch: refetchPending,
    } = useGetPendingLikesQuery()
    const {
        data: likedData,
        isLoading: isLikedLoading,
        isFetching: isLikedFetching,
        error: likedError,
        refetch: refetchLiked,
    } = useGetVotersQuery({}, { skip: !includeLiked })

    const items = data?.items ?? []
    const pendingItems = pendingData?.items ?? []
    const likedItems = likedData?.items ?? []
    const users = useMemo(() => items.map(mapToPreview), [items])
    const pendingUsers = useMemo(
        () =>
            pendingItems.map((item) => ({
                id: item.targetUserId,
                username: item.username ?? `Member #${item.targetUserId}`,
                age: item.age,
                location: item.location,
                avatarUrl: item.photoUrl,
            })),
        [pendingItems]
    )
    const likedUsers = useMemo(
        () => {
            const matchedIds = new Set(items.map((item) => item.id))
            return likedItems
                .filter((item) => !matchedIds.has(item.id))
                .map(mapToPreview)
        },
        [items, likedItems]
    )

    return {
        users,
        pendingUsers,
        likedUsers,
        total: data?.total ?? items.length,
        pendingTotal: pendingData?.total ?? pendingItems.length,
        likedTotal: likedData?.items.length ?? likedItems.length,
        isLoading:
            isLoading ||
            isFetching ||
            isPendingLoading ||
            isPendingFetching ||
            isLikedLoading ||
            isLikedFetching,
        error: error ?? pendingError ?? likedError,
        refetch: () => {
            void refetch()
            void refetchPending()
            void refetchLiked()
        },
    }
}

export type UseMatchesListReturn = ReturnType<typeof useMatchesList>
