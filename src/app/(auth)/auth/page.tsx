import { Suspense } from 'react'

import { AuthPage } from '@/views/auth-page'

export default function Auth() {
    return (
        <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading...</div>}>
            <AuthPage />
        </Suspense>
    )
}
