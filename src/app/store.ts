import { configureStore } from '@reduxjs/toolkit'

import { emailApi } from '@/entities/email'
import { matchApi } from '@/entities/match'
import { subscriptionApi } from '@/entities/subscription'
import { userApi } from '@/entities/user'

export const store = configureStore({
    reducer: {
        [emailApi.reducerPath]: emailApi.reducer,
        [matchApi.reducerPath]: matchApi.reducer,
        [subscriptionApi.reducerPath]: subscriptionApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            emailApi.middleware,
            matchApi.middleware,
            subscriptionApi.middleware,
            userApi.middleware
        ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
