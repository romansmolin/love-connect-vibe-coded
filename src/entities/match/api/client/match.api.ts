import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type {
    BlockUserRequest,
    BlockUserResponse,
    DiscoverMatchesResponse,
    MatchActionRequest,
    MatchActionResponse,
    MatchListResponse,
    ReportUserRequest,
    ReportUserResponse,
    VotersResponse,
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
        getVoters: builder.query<VotersResponse, Record<string, string | number | undefined>>({
            query: (params) => ({
                url: 'match/voters',
                method: 'GET',
                params,
            }),
        }),
        blockUser: builder.mutation<BlockUserResponse, BlockUserRequest>({
            query: (body) => ({
                url: 'match/block',
                method: 'POST',
                body,
            }),
        }),
        reportUser: builder.mutation<ReportUserResponse, ReportUserRequest>({
            query: (body) => ({
                url: 'match/report',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const {
    useDiscoverMatchesQuery,
    useGetMatchesQuery,
    useMatchActionMutation,
    useGetVotersQuery,
    useBlockUserMutation,
    useReportUserMutation,
} = matchApi
