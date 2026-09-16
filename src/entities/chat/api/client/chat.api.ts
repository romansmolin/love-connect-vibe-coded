import { createApi } from '@reduxjs/toolkit/query/react'

import baseQuery from '@/shared/api/base-query'

import type {
    ContactsResponse,
    ConversationMessagesResponse,
    ConversationsResponse,
    MessagesResponse,
    SendConversationMessageRequest,
    SendConversationMessageResponse,
    SendGiftInChatRequest,
    SendGiftInChatResponse,
    SendMessageRequest,
    SendMessageResponse,
    UnlockConversationResponse,
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
            invalidatesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.contactId }, 'Contacts'],
        }),
        sendGiftInChat: builder.mutation<SendGiftInChatResponse, SendGiftInChatRequest>({
            query: (body) => ({
                url: 'chat/gift',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.contactId }, 'Contacts'],
        }),
        getConversations: builder.query<ConversationsResponse, void>({
            query: () => ({ url: 'chat/conversations', method: 'GET' }),
            providesTags: ['Contacts'],
        }),
        getConversationMessages: builder.query<
            ConversationMessagesResponse,
            { peerDatingId: number; before?: string; limit?: number }
        >({
            query: ({ peerDatingId, ...params }) => ({
                url: `chat/conversations/${peerDatingId}/messages`,
                method: 'GET',
                params,
            }),
            providesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.peerDatingId }],
        }),
        sendConversationMessage: builder.mutation<SendConversationMessageResponse, SendConversationMessageRequest>(
            {
                query: ({ peerDatingId, ...body }) => ({
                    url: `chat/conversations/${peerDatingId}/messages`,
                    method: 'POST',
                    body,
                }),
                invalidatesTags: (_result, _error, arg) => [
                    { type: 'Messages', id: arg.peerDatingId },
                    'Contacts',
                ],
            }
        ),
        sendConversationGift: builder.mutation<
            SendGiftInChatResponse,
            { peerDatingId: number; giftId: string; idempotencyKey: string }
        >({
            query: ({ peerDatingId, ...body }) => ({
                url: `chat/conversations/${peerDatingId}/gifts`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.peerDatingId }, 'Contacts'],
        }),
        markConversationRead: builder.mutation<{ lastReadAt: string }, { peerDatingId: number }>({
            query: ({ peerDatingId }) => ({ url: `chat/conversations/${peerDatingId}/read`, method: 'POST' }),
            invalidatesTags: ['Contacts'],
        }),
        unlockConversation: builder.mutation<UnlockConversationResponse, { peerDatingId: number }>({
            query: ({ peerDatingId }) => ({ url: `chat/conversations/${peerDatingId}/unlock`, method: 'POST' }),
            invalidatesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.peerDatingId }, 'Contacts'],
        }),
    }),
})

export const {
    useGetContactsQuery,
    useGetConversationMessagesQuery,
    useGetConversationsQuery,
    useGetMessagesQuery,
    useMarkConversationReadMutation,
    useSendConversationGiftMutation,
    useSendConversationMessageMutation,
    useSendGiftInChatMutation,
    useSendMessageMutation,
    useUnlockConversationMutation,
} = chatApi
