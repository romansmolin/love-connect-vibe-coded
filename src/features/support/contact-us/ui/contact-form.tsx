'use client'

import React from 'react'

import { GenericCard } from '@/shared/components/generic-card'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import { useContactForm } from '../hooks/use-contact-form'

interface ContactFormProps {
    className?: string
}

export const ContactForm: React.FC<ContactFormProps> = ({ className }) => {
    const { formState, canSubmit, isLoading, updateField, handleSubmit, isSuccess } = useContactForm()

    const contactForm = (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                    id="contact-name"
                    placeholder="Name"
                    value={formState.name}
                    onChange={(event) => updateField('name', event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                    id="contact-email"
                    placeholder="Email"
                    type="email"
                    value={formState.email}
                    onChange={(event) => updateField('email', event.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                    id="contact-message"
                    placeholder="Type your message"
                    rows={5}
                    value={formState.message}
                    onChange={(event) => updateField('message', event.target.value)}
                />
            </div>

            <div className="flex items-start gap-3 text-sm">
                <Checkbox
                    checked={formState.acceptPolicy}
                    id="contact-policy"
                    onCheckedChange={(checked) => updateField('acceptPolicy', Boolean(checked))}
                />
                <Label className="text-muted-foreground" htmlFor="contact-policy">
                    By selecting this you agree to our{' '}
                    <a className="text-primary underline" href="/privacy-policy">
                        Privacy Policy
                    </a>
                    .
                </Label>
            </div>

            {isSuccess && (
                <p className="text-sm font-medium text-green-600">
                    Thank you for reaching out! We&apos;ll get back to you shortly.
                </p>
            )}

            <Button className="w-full" disabled={!canSubmit} size="lg" type="submit">
                {isLoading ? 'Sending...' : 'Send message'}
            </Button>
        </form>
    )

    const contactFormHeader = (
        <div className="text-center flex flex-col justify-center items-center gap-5">
            <span className="text-3xl font-semibold">Get in touch</span>
        </div>
    )

    const contactFormDescription = (
        <span className="text-base text-muted-foreground">
            Write one or two welcoming sentences that encourage contact. Include your response time commitment and
            highlight your team&apos;s readiness to help.
        </span>
    )
    return (
        <section className={cn('w-full', className)}>
            <GenericCard
                cardContainerClassName="border border-input shadow-none"
                cardContent={contactForm}
                cardDescription={contactFormDescription}
                cardHeader={contactFormHeader}
            />
        </section>
    )
}
