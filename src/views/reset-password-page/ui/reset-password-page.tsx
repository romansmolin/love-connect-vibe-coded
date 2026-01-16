'use client'

import React from 'react'

import { ResetPasswordForm } from '@/features/auth'

interface ResetPasswordPageProps {
    initialToken?: string
}

export const ResetPasswordPage = ({ initialToken }: ResetPasswordPageProps) => {
    return (
        <div className="w-full max-w-lg py-20">
            <ResetPasswordForm initialToken={initialToken} />
        </div>
    )
}
