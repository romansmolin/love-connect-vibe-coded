'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const endSession = async () => {
    try {
        const cookiesStore = await cookies()
        cookiesStore.delete('token')
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error while fetching posts'
        console.error('Failed to end session: ', message)
    } finally {
        redirect('/')
    }
}
