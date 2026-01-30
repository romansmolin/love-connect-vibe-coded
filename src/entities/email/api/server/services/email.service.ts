import crypto from 'node:crypto'

import nodemailer from 'nodemailer'

import {
    APP_BASE_URL,
    EMAIL_FROM,
    EMAIL_FROM_NAME,
    EMAIL_VERIFICATION_TTL_HOURS,
    SMTP_HOST,
    SMTP_PASS,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
} from '../config'
import { emailContactRepo } from '../repositories/email-contact.repo'
import { emailVerificationRepo } from '../repositories/email-verification.repo'

const formatAmount = (amountCents: number, currency: string) => {
    const amount = (amountCents / 100).toFixed(2)
    return `${amount} ${currency}`
}

const getTransporter = () => {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    })
}

const sendMail = async (params: { to: string; subject: string; html: string; text: string }) => {
    const transporter = getTransporter()
    if (!transporter) {
        console.warn('[email] SMTP not configured')
        return false
    }

    await transporter.sendMail({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
    })

    return true
}

const buildVerifyUrl = (token: string) => {
    if (!APP_BASE_URL) return ''
    const base = APP_BASE_URL.replace(/\/$/, '')
    return `${base}/api/email/verify?token=${token}`
}

export const emailService = {
    async sendTestEmail(to: string) {
        const subject = 'LoveBond SMTP test'
        const text = 'This is a test email from LoveBond SMTP setup.'
        const html = '<p>This is a test email from LoveBond SMTP setup.</p>'
        return sendMail({ to, subject, html, text })
    },

    async createVerificationToken(params: { externalUserId: string; email: string }) {
        const contact = await emailContactRepo.upsertByExternalUserId({
            externalUserId: params.externalUserId,
            email: params.email,
        })

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
        const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000)

        await emailVerificationRepo.createToken({
            emailContactId: contact.id,
            tokenHash,
            expiresAt,
        })

        return { token, email: contact.email }
    },

    async sendVerificationEmail(params: { externalUserId: string; email: string; name?: string }) {
        const { token, email } = await this.createVerificationToken(params)
        const verifyUrl = buildVerifyUrl(token)

        if (!verifyUrl) {
            console.warn('[email] APP_BASE_URL is not configured')
            return false
        }

        const greeting = params.name ? `Hi ${params.name},` : 'Hi,'
        const subject = 'Verify your LoveBond email'
        const text = `${greeting}\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nThis link expires in ${EMAIL_VERIFICATION_TTL_HOURS} hours.`
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>${greeting}</p>
                <p>Please verify your email by clicking the button below:</p>
                <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Verify email</a></p>
                <p>Or copy and paste this link:</p>
                <p>${verifyUrl}</p>
                <p>This link expires in ${EMAIL_VERIFICATION_TTL_HOURS} hours.</p>
            </div>
        `.trim()

        return sendMail({ to: email, subject, html, text })
    },

    async verifyEmailToken(token: string) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
        const record = await emailVerificationRepo.findValidToken(tokenHash)
        if (!record) {
            return { ok: false as const, reason: 'invalid' as const }
        }

        await emailVerificationRepo.markUsed(record.id)
        await emailContactRepo.markVerified(record.emailContactId)

        return { ok: true as const, email: record.emailContact.email }
    },

    async sendCreditReceiptEmail(params: {
        externalUserId: string
        credits: number
        amountCents: number
        currency: string
        transactionId: string
    }) {
        const contact = await emailContactRepo.findByExternalUserId(params.externalUserId)
        if (!contact?.email) return false

        const subject = 'Your LoveBond credit receipt'
        const total = formatAmount(params.amountCents, params.currency)
        const text = `Thanks for your purchase!\n\nCredits: ${params.credits}\nTotal: ${total}\nTransaction ID: ${params.transactionId}\n\nIf you have any questions, reply to this email.`
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Thanks for your purchase!</p>
                <p><strong>Credits:</strong> ${params.credits}</p>
                <p><strong>Total:</strong> ${total}</p>
                <p><strong>Transaction ID:</strong> ${params.transactionId}</p>
                <p>If you have any questions, reply to this email.</p>
            </div>
        `.trim()

        return sendMail({ to: contact.email, subject, html, text })
    },
}
