import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type {
    SignInRequest,
    SignInResponse,
    SignUpRequest,
    SignUpResponse,
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
    }),
})

export const { useSignInMutation, useSignUpMutation, useGetUserInfoQuery, useGetUserProfileQuery } = userApi
