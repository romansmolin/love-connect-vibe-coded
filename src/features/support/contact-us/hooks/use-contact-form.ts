'use client'

import { FormEvent, useCallback, useMemo, useState } from 'react'

import { toast } from 'sonner'

import { useSendContactUsRequestMutation } from '@/entities/email'

interface ContactFormState {
    name: string
    email: string
    message: string
    acceptPolicy: boolean
}

export const useContactForm = () => {
    const [formState, setFormState] = useState<ContactFormState>({
        name: '',
        email: '',
        message: '',
        acceptPolicy: false,
    })

    const [sendContactUs, { isLoading, isSuccess }] = useSendContactUsRequestMutation()

    const canSubmit = useMemo(() => {
        if (!formState.acceptPolicy) return false

        return Boolean(formState.name.trim() && formState.email.trim() && formState.message.trim())
    }, [formState])

    const updateField = useCallback(<K extends keyof ContactFormState>(field: K, value: ContactFormState[K]) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }))
    }, [])

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            if (!canSubmit) return

            try {
                const { acceptPolicy, ...rest } = formState

                await sendContactUs({ ...rest }).unwrap()

                toast.success('Email sent successfully!')
            } catch {
                toast.error('Something went wrong try later!')
            }
        },
        [canSubmit, formState, sendContactUs]
    )

    return {
        formState,
        isLoading,
        canSubmit,
        updateField,
        handleSubmit,
        isSuccess,
    }
}

export type UseContactFormReturn = ReturnType<typeof useContactForm>
