import { ResetPasswordPage } from '@/views/reset-password-page'

interface ResetPasswordPageProps {
    searchParams: Promise<{
        token?: string
    }>
}

export default async function ResetPassword({ searchParams }: ResetPasswordPageProps) {
    const resolvedSearchParams = await searchParams
    return <ResetPasswordPage initialToken={resolvedSearchParams?.token} />
}
