import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import { AuthResponse, SignInRequest, SignUpRequest, UserInfoResponse } from '../../model/user.types'

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery,
    endpoints: (builder) => ({
        getUserInfo: builder.query<UserInfoResponse, void>({
            query: () => ({
                url: '/auth/me',
                method: 'GET',
            }),
        }),
        signUp: builder.mutation<AuthResponse, SignUpRequest>({
            query: (body) => ({
                url: '/auth/sign-up',
                method: 'POST',
                body,
            }),
        }),
        signIn: builder.mutation<AuthResponse, SignInRequest>({
            query: (body) => ({
                url: '/auth/sign-in',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const { useGetUserInfoQuery, useSignInMutation, useSignUpMutation } = userApi
