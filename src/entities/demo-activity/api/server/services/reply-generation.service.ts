import type { SimulatedMessage, SimulatedPersona } from '@prisma/client'
import OpenAI from 'openai'

import { buildSystemPrompt } from '../../../lib/system-prompt'

let client: OpenAI | undefined

const getClient = (): OpenAI => {
    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }

    return client
}

const FALLBACK_REPLY = "Hey, sorry, got pulled away! What's up?"

export const replyGenerationService = {
    async generateReply(persona: SimulatedPersona, history: SimulatedMessage[]): Promise<string> {
        // Keep the simulated conversation usable in local/dev environments where OpenAI is not
        // configured. Production/demo deployments use the model whenever the key is available.
        if (!process.env.OPENAI_API_KEY) return FALLBACK_REPLY

        const completion = await getClient().chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.8,
            max_tokens: 200,
            messages: [
                { role: 'system', content: buildSystemPrompt(persona) },
                ...history.map((message) => ({
                    role: message.senderIsPersona ? ('assistant' as const) : ('user' as const),
                    content: message.text,
                })),
            ],
        })

        return completion.choices[0]?.message?.content?.trim() || FALLBACK_REPLY
    },
}
