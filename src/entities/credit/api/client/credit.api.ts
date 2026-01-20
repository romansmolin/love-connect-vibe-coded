import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type { CreditWalletResponse, PurchaseCreditsRequest, PurchaseCreditsResponse } from '../../model/types'

export const creditApi = createApi({
    reducerPath: 'creditApi',
    baseQuery,
    tagTypes: ['CreditWallet'],
    endpoints: (builder) => ({
        getWallet: builder.query<CreditWalletResponse, void>({
            query: () => ({ url: 'credits/wallet', method: 'GET' }),
            providesTags: ['CreditWallet'],
        }),
        purchaseCredits: builder.mutation<PurchaseCreditsResponse, PurchaseCreditsRequest>({
            query: (body) => ({
                url: 'credits/purchase',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CreditWallet'],
        }),
    }),
})

export const { useGetWalletQuery, usePurchaseCreditsMutation } = creditApi
