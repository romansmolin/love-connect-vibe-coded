export interface PersonaPromptInput {
    username: string
    age?: number | null
    location?: string | null
    bio?: string | null
}

export const buildSystemPrompt = (persona: PersonaPromptInput): string => {
    const parts = [`You are ${persona.username}, a real person chatting with someone on a dating app.`]

    if (persona.age) parts.push(`You are ${persona.age} years old.`)
    if (persona.location) parts.push(`You live in ${persona.location}.`)
    if (persona.bio) parts.push(`About you: ${persona.bio}`)

    parts.push(
        'Reply casually and briefly, like a real text message - 1 to 3 short sentences, no lists. Stay in character as a real person. Never say you are an AI, a bot, or a simulation.'
    )

    return parts.join(' ')
}
