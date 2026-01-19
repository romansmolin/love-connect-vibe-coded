import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type {
    DiscoverMatchesResponse,
    MatchActionRequest,
    MatchActionResponse,
    MatchListResponse,
} from '../../model/types'

export const matchApi = createApi({
    reducerPath: 'matchApi',
    baseQuery,
    endpoints: (builder) => ({
        discoverMatches: builder.query<DiscoverMatchesResponse, Record<string, string | number | undefined>>({
            query: (params) => ({
                url: 'match/discover',
                method: 'GET',
                params,
            }),
        }),
        getMatches: builder.query<MatchListResponse, void>({
            query: () => ({
                url: 'match/list',
                method: 'GET',
            }),
        }),
        matchAction: builder.mutation<MatchActionResponse, MatchActionRequest>({
            query: (body) => ({
                url: 'match/action',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const { useDiscoverMatchesQuery, useGetMatchesQuery, useMatchActionMutation } = matchApi
