import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type {
    GiftCatalogResponse,
    GiftInventoryResponse,
    PurchaseGiftRequest,
    PurchaseGiftResponse,
    SendGiftRequest,
    SendGiftResponse,
} from '../../model/types'

export const giftApi = createApi({
    reducerPath: 'giftApi',
    baseQuery,
    tagTypes: ['GiftCatalog', 'GiftInventory'],
    endpoints: (builder) => ({
        getCatalog: builder.query<GiftCatalogResponse, void>({
            query: () => ({ url: 'gifts/catalog', method: 'GET' }),
            providesTags: ['GiftCatalog'],
        }),
        getInventory: builder.query<GiftInventoryResponse, void>({
            query: () => ({ url: 'gifts/inventory', method: 'GET' }),
            providesTags: ['GiftInventory'],
        }),
        purchaseGift: builder.mutation<PurchaseGiftResponse, PurchaseGiftRequest>({
            query: (body) => ({
                url: 'gifts/purchase',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['GiftInventory'],
        }),
        sendGift: builder.mutation<SendGiftResponse, SendGiftRequest>({
            query: (body) => ({
                url: 'gifts/send',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['GiftInventory'],
        }),
    }),
})

export const { useGetCatalogQuery, useGetInventoryQuery, usePurchaseGiftMutation, useSendGiftMutation } = giftApi
