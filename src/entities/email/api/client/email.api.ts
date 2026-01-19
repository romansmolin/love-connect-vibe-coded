import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type { ContactUsRequest, ContactUsResponse } from '../../model/types'

export const emailApi = createApi({
    reducerPath: 'emailApi',
    baseQuery,
    endpoints: (builder) => ({
        sendContactUsRequest: builder.mutation<ContactUsResponse, ContactUsRequest>({
            query: (body) => ({
                url: 'support/contact-us',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const { useSendContactUsRequestMutation } = emailApi
