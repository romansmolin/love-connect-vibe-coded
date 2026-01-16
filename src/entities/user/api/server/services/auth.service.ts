import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

import { SignInInput, SignUpInput } from '../dto/auth.dto'
import { AuthError } from '../errors/auth.errors'
import {
    createUser,
    findUserByEmail,
    findUserByUsername,
    getUserById,
    getUserForAuth,
} from '../repositories/user.repo'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30
const PASSWORD_ROUNDS = 12

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new AuthError('Server configuration error.', 500)
    }
    return new TextEncoder().encode(secret)
}

const createToken = async (
    user: { id: string; name: string; email: string; username: string },
    expiresInSeconds: number
) => {
    const now = Math.floor(Date.now() / 1000)

    return new SignJWT({
        name: user.name,
        email: user.email,
        username: user.username,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(user.id)
        .setIssuedAt(now)
        .setExpirationTime(now + expiresInSeconds)
        .sign(getJwtSecret())
}

export const getCurrentUser = async (token: string) => {
    const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] })
    const userId = payload.sub
    if (!userId) {
        throw new AuthError('Invalid session.', 401)
    }

    const user = await getUserById(userId)
    if (!user) {
        throw new AuthError('User not found.', 404)
    }

    return user
}

export const signUp = async (input: SignUpInput) => {
    const existingEmail = await findUserByEmail(input.email)
    if (existingEmail) {
        throw new AuthError('Email already in use.', 409)
    }

    const existingUsername = await findUserByUsername(input.username)
    if (existingUsername) {
        throw new AuthError('Username already in use.', 409)
    }

    const passwordHash = await hash(input.password, PASSWORD_ROUNDS)
    let user
    try {
        user = await createUser({
            name: input.name,
            email: input.email,
            username: input.username,
            passwordHash,
            gender: input.gender,
            lookingFor: input.lookingFor,
            dateOfBirth: input.dateOfBirth,
            city: input.city,
        })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new AuthError('Email or username already in use.', 409)
        }

        throw error
    }

    const token = await createToken(user, SESSION_MAX_AGE)

    return {
        user,
        token,
        maxAge: SESSION_MAX_AGE,
    }
}

export const signIn = async (input: SignInInput) => {
    const user = await getUserForAuth(input.username)
    if (!user) {
        throw new AuthError('Invalid username or password.', 401)
    }

    const isValidPassword = await compare(input.password, user.passwordHash)
    if (!isValidPassword) {
        throw new AuthError('Invalid username or password.', 401)
    }

    const maxAge = input.rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE
    const token = await createToken(user, maxAge)

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
        },
        token,
        maxAge,
    }
}
