import { AuthPage } from '@/views/auth-page'

export default async function Auth({ searchParams }: { searchParams?: Promise<{ tab?: string }> }) {
    const resolvedParams = searchParams ? await searchParams : undefined
    const defaultTab = resolvedParams?.tab === 'sign-in' ? 'sign-in' : 'sign-up'

    return <AuthPage defaultTab={defaultTab} />
}
