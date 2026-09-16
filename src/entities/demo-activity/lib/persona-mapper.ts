import type { ContactPreview } from '@/entities/chat/model/types'
import type { MatchCandidate, MatchGender } from '@/entities/match/model/types'

export interface PersonaLike {
    fotochatUserId: number
    username: string
    age?: number | null
    location?: string | null
    gender?: string | null
    photoUrl?: string | null
}

export interface PersonaUpsertInput {
    fotochatUserId: number
    username: string
    age?: number
    location?: string
    gender?: string
    photoUrl?: string
}

const MATCH_GENDERS: MatchGender[] = ['man', 'woman', 'couple']

const asMatchGender = (value?: string | null): MatchGender | undefined =>
    value && (MATCH_GENDERS as string[]).includes(value) ? (value as MatchGender) : undefined

export const mapPersonaToMatchCandidate = (persona: PersonaLike): MatchCandidate => ({
    id: persona.fotochatUserId,
    username: persona.username,
    age: persona.age ?? undefined,
    gender: asMatchGender(persona.gender),
    location: persona.location ?? undefined,
    photoUrl: persona.photoUrl ?? undefined,
})

export const mapPersonaToContactPreview = (
    persona: PersonaLike,
    lastMessagePreview?: string,
    lastMessageAt?: string
): ContactPreview => ({
    id: persona.fotochatUserId,
    username: persona.username,
    avatarUrl: persona.photoUrl ?? undefined,
    source: 'ai',
    onlineStatus: 'online',
    isFriend: true,
    lastMessagePreview,
    lastMessageAt,
})

export const mapCandidateToPersonaInput = (candidate: MatchCandidate): PersonaUpsertInput => ({
    fotochatUserId: candidate.id,
    username: candidate.username,
    age: candidate.age,
    location: candidate.location,
    gender: candidate.gender,
    photoUrl: candidate.photoUrl,
})
