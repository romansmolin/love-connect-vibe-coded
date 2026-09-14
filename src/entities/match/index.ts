export {
    matchApi,
    useBlockUserMutation,
    useDiscoverMatchesQuery,
    useGetMatchesQuery,
    useGetVotersQuery,
    useMatchActionMutation,
    useReportUserMutation,
} from './api/client/match.api'
export type {
    BlockUserRequest,
    BlockUserResponse,
    DiscoverMatchesResponse,
    MatchAction,
    MatchActionRequest,
    MatchActionResponse,
    MatchCandidate,
    MatchGender,
    MatchListResponse,
    ReportUserRequest,
    ReportUserResponse,
    VotersResponse,
} from './model/types'
