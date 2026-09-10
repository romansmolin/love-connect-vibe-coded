'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { toast } from 'sonner'

import type { MatchAction, MatchCandidate } from '@/entities/match'
import { useDiscoverMatchesQuery, useMatchActionMutation } from '@/entities/match'

import { getDemoCity, getExcludedProfileIds, rememberProcessedProfile } from '../lib/demo-city'
import type { DemoCity } from '../lib/demo-city'

export interface MatchFlowFilters {
    gender?: 'men' | 'women' | 'couple'
    ageFrom?: number
    ageTo?: number
    perPage?: number
    city?: DemoCity
    pool?: boolean
}

const DEFAULT_PER_PAGE = 12

export const useMatchFlow = (filters: MatchFlowFilters = {}) => {
    const [page, setPage] = useState(0)
    const [index, setIndex] = useState(0)
    const [processedProfileIds, setProcessedProfileIds] = useState<number[]>([])
    const [initialExcludedIds, setInitialExcludedIds] = useState<number[]>([])
    const [matchAction, { isLoading: isActing }] = useMatchActionMutation()

    useEffect(() => {
        const ids = getExcludedProfileIds()
        setProcessedProfileIds(ids)
        setInitialExcludedIds(ids)
    }, [])

    useEffect(() => {
        setPage(0)
        setIndex(0)
    }, [filters.ageFrom, filters.ageTo, filters.city, filters.gender, filters.pool])

    const queryParams = useMemo(
        () => ({
            page,
            perPage: filters.pool ? 100 : (filters.perPage ?? DEFAULT_PER_PAGE),
            gender: filters.gender,
            ageFrom: filters.ageFrom,
            ageTo: filters.ageTo,
            pool: filters.pool ? 1 : undefined,
            excludeIds: filters.pool ? initialExcludedIds.join(',') : undefined,
        }),
        [filters.ageFrom, filters.ageTo, filters.gender, filters.perPage, filters.pool, initialExcludedIds, page]
    )

    const { data, isLoading, isFetching, error, refetch } = useDiscoverMatchesQuery(queryParams)

    const items = useMemo(() => {
        return (data?.items ?? [])
            .filter((candidate) => !processedProfileIds.includes(candidate.id))
            .map((candidate) => ({ ...candidate, location: getDemoCity(candidate.id) }))
            .filter((candidate) => !filters.city || candidate.location === filters.city)
    }, [data?.items, filters.city, processedProfileIds])
    const current = items[index] ?? null

    useEffect(() => {
        setIndex(0)
    }, [page, data?.items, filters.city, filters.pool])

    useEffect(() => {
        if (filters.pool || index < items.length) return

        const totalPages = data?.totalPages
        if (typeof totalPages === 'number' && page < totalPages - 1) {
            setPage((previous) => previous + 1)
        }
    }, [data?.totalPages, filters.pool, index, items.length, page])

    const performAction = useCallback(
        async (action: MatchAction, candidate: MatchCandidate | null) => {
            if (!candidate || isActing) return

            try {
                const response = await matchAction({ action, userId: candidate.id }).unwrap()

                rememberProcessedProfile(candidate.id)
                setProcessedProfileIds((previous) =>
                    previous.includes(candidate.id) ? previous : [...previous, candidate.id]
                )

                if (response.isMatch) {
                    toast.success("It's a match!")
                }
            } catch (actionError) {
                const message =
                    (actionError as { data?: { message?: string } })?.data?.message ?? 'Unable to update match.'
                toast.error(message)
                return
            }

            // Removing the current item shifts the next item into the same index.
            // The pagination effect loads the next API page when the batch is exhausted.
        },
        [isActing, matchAction]
    )

    const like = useCallback(() => performAction('like', current), [current, performAction])
    const dislike = useCallback(() => performAction('dislike', current), [current, performAction])

    return {
        current,
        isLoading: isLoading || isFetching,
        isActing,
        error,
        like,
        dislike,
        refetch,
        page,
        index,
        remaining: Math.max(items.length - index, 0),
    }
}

export type UseMatchFlowReturn = ReturnType<typeof useMatchFlow>
