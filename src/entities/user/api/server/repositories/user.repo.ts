import { prisma } from '@/shared/lib/prisma'

const publicUserSelect = {
    id: true,
    name: true,
    email: true,
    username: true,
}

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: { email },
        select: { id: true },
    })
}

export const findUserByUsername = async (username: string) => {
    return prisma.user.findUnique({
        where: { username },
        select: { id: true },
    })
}

export const createUser = async (data: {
    name: string
    email: string
    username: string
    passwordHash: string
    gender: 'woman' | 'man' | 'non_binary' | 'other'
    lookingFor: 'women' | 'man' | 'couple'
    dateOfBirth: Date
    city: string
}) => {
    return prisma.user.create({
        data,
        select: publicUserSelect,
    })
}

export const getUserForAuth = async (username: string) => {
    return prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            passwordHash: true,
        },
    })
}

export const getUserById = async (id: string) => {
    return prisma.user.findUnique({
        where: { id },
        select: publicUserSelect,
    })
}
