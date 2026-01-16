import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const isAtLeastAge = (date: Date, minimumYears: number) => {
    const today = new Date()
    const cutoff = new Date(today.getFullYear() - minimumYears, today.getMonth(), today.getDate())
    return date <= cutoff
}

const dateOfBirthSchema = z
    .string()
    .trim()
    .regex(dateRegex, 'Date of birth must be in YYYY-MM-DD format.')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Date of birth is invalid.')
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .refine((value) => isAtLeastAge(value, 18), 'You must be at least 18 years old.')

export const signUpSchema = z.object({
    name: z.string().trim().min(2, 'Name is required.'),
    email: z.string().trim().email('Email is invalid.').transform((value) => value.toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters.')
        .max(32, 'Username must be 32 characters or fewer.')
        .transform((value) => value.toLowerCase()),
    gender: z.enum(['woman', 'man', 'non_binary', 'other']),
    lookingFor: z.enum(['women', 'man', 'couple']),
    dateOfBirth: dateOfBirthSchema,
    city: z.string().trim().min(2, 'City is required.'),
})

export const signInSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, 'Username is required.')
        .transform((value) => value.toLowerCase()),
    password: z.string().min(1, 'Password is required.'),
    rememberMe: z.boolean().optional().default(false),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
