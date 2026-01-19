import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type { CancelSubscriptionResponse, UpdateSubscriptionRequest, UpdateSubscriptionResponse } from '../../model/types'

export const subscriptionApi = createApi({
    reducerPath: 'subscriptionApi',
    baseQuery,
    endpoints: (builder) => ({
        updateUserPlan: builder.mutation<UpdateSubscriptionResponse, UpdateSubscriptionRequest>({
            query: (body) => ({
                url: 'subscription/update',
                method: 'POST',
                body,
            }),
        }),
        cancelSubscription: builder.mutation<CancelSubscriptionResponse, void>({
            query: () => ({
                url: 'subscription/cancel',
                method: 'POST',
            }),
        }),
    }),
})

export const { useUpdateUserPlanMutation, useCancelSubscriptionMutation } = subscriptionApi
