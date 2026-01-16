import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

export const emailApi = createApi({
    reducerPath: 'emailApi',
    baseQuery,
    endpoints: (builder) => ({
        sendContactUsRequest: builder.mutation<void, { name: string; email: string; message: string }>({
            query: ({ name, email, message }) => ({
                url: '/contact-us',
                method: 'POST',
                body: {
                    name,
                    email,
                    message,
                },
            }),
        }),
    }),
})

export const { useSendContactUsRequestMutation } = emailApi
