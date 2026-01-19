export interface ContactPreview {
    id: number
    username: string
    avatarUrl?: string
    unreadCount?: number
    onlineStatus?: 'online' | 'recent' | 'offline'
    isFriend?: boolean
    lastMessagePreview?: string
}

export interface ChatMessage {
    id: number | string
    senderId?: number
    text?: string
    sentAt?: string
    extra?: string
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
}

export interface SendMessageResponse {
    message?: string
    date?: string
}
