import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    baseQuery,
    endpoints: (builder) => ({
        cancelSubscription: builder.mutation<void, void>({
            query: () => ({
                url: '/subscription/cancel',
                method: 'POST',
            }),
        }),
        updateUserPlan: builder.mutation<void, { planName: string; planType?: string }>({
            query: (body) => ({
                url: '/subscription/update',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const { useCancelSubscriptionMutation, useUpdateUserPlanMutation } = subscriptionApi
