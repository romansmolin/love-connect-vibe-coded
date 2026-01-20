import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type {
    DeleteAccountRequest,
    DeleteAccountResponse,
    LogoutResponse,
    LostPassRequest,
    LostPassResponse,
    SignInRequest,
    SignInResponse,
    SignUpRequest,
    SignUpResponse,
    UpdateProfileRequest,
    UpdateProfileResponse,
    UserInfoResponse,
    UserProfileResponse,
} from '../../model/types'

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        signIn: builder.mutation<SignInResponse, SignInRequest>({
            query: (body) => ({
                url: 'auth/sign-in',
                method: 'POST',
                body,
            }),
        }),
        signUp: builder.mutation<SignUpResponse, SignUpRequest>({
            query: (body) => ({
                url: 'auth/sign-up',
                method: 'POST',
                body,
            }),
        }),
        getUserInfo: builder.query<UserInfoResponse, void>({
            query: () => ({
                url: 'auth/me',
                method: 'GET',
            }),
        }),
        getUserProfile: builder.query<UserProfileResponse, void>({
            query: () => ({
                url: 'user/profile',
                method: 'GET',
            }),
        }),
        updateProfile: builder.mutation<UpdateProfileResponse, UpdateProfileRequest>({
            query: (body) => ({
                url: 'user/profile',
                method: 'PATCH',
                body,
            }),
        }),
        requestPasswordReset: builder.mutation<LostPassResponse, LostPassRequest>({
            query: (body) => ({
                url: 'auth/lostpass',
                method: 'POST',
                body,
            }),
        }),
        logout: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: 'auth/logout',
                method: 'POST',
            }),
        }),
        deleteAccount: builder.mutation<DeleteAccountResponse, DeleteAccountRequest | void>({
            query: (body) => ({
                url: 'user/delete',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const {
    useSignInMutation,
    useSignUpMutation,
    useGetUserInfoQuery,
    useGetUserProfileQuery,
    useUpdateProfileMutation,
    useRequestPasswordResetMutation,
    useLogoutMutation,
    useDeleteAccountMutation,
} = userApi
