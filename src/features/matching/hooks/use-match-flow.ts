'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { toast } from 'sonner'

import type { MatchAction, MatchCandidate } from '@/entities/match'
import { useDiscoverMatchesQuery, useMatchActionMutation } from '@/entities/match'

export interface MatchFlowFilters {
    gender?: 'men' | 'women' | 'couple'
    ageFrom?: number
    ageTo?: number
    perPage?: number
}

const DEFAULT_PER_PAGE = 12

export const useMatchFlow = (filters: MatchFlowFilters = {}) => {
    const [page, setPage] = useState(0)
    const [index, setIndex] = useState(0)
    const [matchAction, { isLoading: isActing }] = useMatchActionMutation()

    const queryParams = useMemo(
        () => ({
            page,
            perPage: filters.perPage ?? DEFAULT_PER_PAGE,
            gender: filters.gender,
            ageFrom: filters.ageFrom,
            ageTo: filters.ageTo,
        }),
        [filters.ageFrom, filters.ageTo, filters.gender, filters.perPage, page]
    )

    const { data, isLoading, isFetching, error, refetch } = useDiscoverMatchesQuery(queryParams)

    const items = data?.items ?? []
    const current = items[index] ?? null

    useEffect(() => {
        setIndex(0)
    }, [page, data?.items])

    const goNext = useCallback(() => {
        setIndex((prev) => prev + 1)
    }, [])

    const advance = useCallback(() => {
        const isLast = index >= items.length - 1
        if (!isLast) {
            goNext()
            return
        }

        const totalPages = data?.totalPages
        if (typeof totalPages === 'number' && page < totalPages - 1) {
            setPage((prev) => prev + 1)
            return
        }

        setIndex(items.length)
    }, [data?.totalPages, goNext, index, items.length, page])

    const performAction = useCallback(
        async (action: MatchAction, candidate: MatchCandidate | null) => {
            if (!candidate || isActing) return

            try {
                const response = await matchAction({ action, userId: candidate.id }).unwrap()

                if (response.isMatch) {
                    toast.success("It's a match!")
                }
            } catch (actionError) {
                const message =
                    (actionError as { data?: { message?: string } })?.data?.message ?? 'Unable to update match.'
                toast.error(message)
                return
            }

            advance()
        },
        [advance, isActing, matchAction]
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
