import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type {
    ContactsResponse,
    MessagesResponse,
    SendMessageRequest,
    SendMessageResponse,
} from '../../model/types'

export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery,
    tagTypes: ['Contacts', 'Messages'],
    endpoints: (builder) => ({
        getContacts: builder.query<ContactsResponse, void>({
            query: () => ({ url: 'chat/contacts', method: 'GET' }),
            providesTags: ['Contacts'],
        }),
        getMessages: builder.query<MessagesResponse, { contactId: number; contact?: string }>({
            query: (params) => ({
                url: 'chat/messages',
                method: 'GET',
                params,
            }),
            providesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.contactId }],
        }),
        sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
            query: (body) => ({
                url: 'chat/send',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Messages', id: arg.contactId },
                'Contacts',
            ],
        }),
    }),
})

export const { useGetContactsQuery, useGetMessagesQuery, useSendMessageMutation } = chatApi
