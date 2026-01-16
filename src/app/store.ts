import { configureStore } from '@reduxjs/toolkit'

import { emailApi } from '@/entities/email/api/client/email.api'
import { subscriptionApi } from '@/entities/subscription'
import { userApi } from '@/entities/user'

export const store = configureStore({
    reducer: {
        [userApi.reducerPath]: userApi.reducer,
        [emailApi.reducerPath]: emailApi.reducer,
        [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(userApi.middleware)
            .concat(emailApi.middleware)
            .concat(subscriptionApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
