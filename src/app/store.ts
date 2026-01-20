import { configureStore } from '@reduxjs/toolkit'

import { chatApi } from '@/entities/chat'
import { creditApi } from '@/entities/credit'
import { emailApi } from '@/entities/email'
import { giftApi } from '@/entities/gift'
import { matchApi } from '@/entities/match'
import { subscriptionApi } from '@/entities/subscription'
import { userApi } from '@/entities/user'

export const store = configureStore({
    reducer: {
        [chatApi.reducerPath]: chatApi.reducer,
        [creditApi.reducerPath]: creditApi.reducer,
        [emailApi.reducerPath]: emailApi.reducer,
        [giftApi.reducerPath]: giftApi.reducer,
        [matchApi.reducerPath]: matchApi.reducer,
        [subscriptionApi.reducerPath]: subscriptionApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            chatApi.middleware,
            creditApi.middleware,
            emailApi.middleware,
            giftApi.middleware,
            matchApi.middleware,
            subscriptionApi.middleware,
            userApi.middleware
        ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
