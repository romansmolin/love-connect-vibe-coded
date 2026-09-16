export interface ContactPreview {
    id: number
    username: string
    avatarUrl?: string
    source?: 'fotochat' | 'ai'
    unreadCount?: number
    onlineStatus?: 'online' | 'recent' | 'offline'
    isFriend?: boolean
    lastMessagePreview?: string
    lastMessageAt?: string
}

export interface ChatMessage {
    id: number | string
    senderId?: number
    senderUsername?: string
    text?: string
    sentAt?: string
    extra?: string
    gift?: ChatMessageGift
}

export interface ChatMessageGift {
    transactionId: string
    giftId: string
    name: string
    emoji: string
    imageUrl: string
}

export interface ContactsResponse {
    contacts: ContactPreview[]
}

export interface MessagesResponse {
    messages: ChatMessage[]
}

export interface SendMessageRequest {
    contactId: number
    contact?: string
    message: string
    idempotencyKey?: string
}

export interface SendMessageResponse {
    message?: string
    date?: string
}

export interface SendLocalMessageResponse {
    message: ChatMessage
}

export interface SendGiftInChatRequest {
    contactId: number
    giftId: string
    idempotencyKey: string
}

export interface SendGiftInChatResponse {
    message: ChatMessage
    transactionId: string
    creditsSpent: number
    walletBalance: number
}

export interface ConversationSummary {
    peerDatingId: number
    lastMessageAt: string | null
    lastReadAt: string | null
    lastPreview: string | null
    unreadCount: number
    peerProfile: {
        username: string
        avatarUrl?: string
        isOnline: boolean
    } | null
}

export interface ConversationsResponse {
    items: ConversationSummary[]
}

export interface ConversationMessage {
    id: string
    senderDatingId: number
    body: string
    createdAt: string
    deliveredAt: string | null
    readAt: string | null
    isAiGenerated: boolean
    gift?: ChatMessageGift
}

export interface ConversationMessagesResponse {
    messages: ConversationMessage[]
    nextCursor: string | null
    unlocked: boolean
    peerIsAdmirer: boolean
}

export interface SendConversationMessageRequest {
    peerDatingId: number
    body: string
    idempotencyKey: string
}

export interface SendConversationMessageResponse {
    message: ConversationMessage
}

export interface UnlockConversationResponse {
    unlockedAt: string
    remainingBalance: number
}
