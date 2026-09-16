export const dynamic = 'force-dynamic'

import { PaymentStatusPage } from '@/views/payment-return'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const PendingPage = async ({ searchParams }: { searchParams: SearchParams }) => {
    const resolved = await searchParams
    const raw = resolved?.token
    const token = Array.isArray(raw) ? raw[0] : raw
    return <PaymentStatusPage status="pending" token={token} />
}

export default PendingPage
