import { Suspense } from 'react'

import { ChatPage } from '@/views/chat-page'

export default function Chat() {
    return (
        <Suspense>
            <ChatPage />
        </Suspense>
    )
}
