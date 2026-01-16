import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { z } from 'zod'

const stripCitations = (value?: string) =>
    (value ?? '').replace(/:contentReference\[oaicite:[^\]]+\](\{[^}]*\})?/g, '')

const posts = defineCollection({
    name: 'posts',
    directory: 'content/posts',
    include: '**/*.mdx',
    schema: z.object({
        title: z.string(),
        metaTitle: z.string().optional(),
        description: z.string().max(180),
        cover: z.string().optional(), // e.g. "/images/posts/giant-guide/cover.avif"
        pubDate: z.string(), // ISO string
        tags: z.array(z.string()).default([]),
    }),
    // Build-time: turn raw MDX into a compiled string
    transform: async (doc, ctx) => {
        const cleanedDoc = { ...doc, content: stripCitations(doc.content ?? '') }
        const mdx = await compileMDX(ctx, cleanedDoc)
        return { ...cleanedDoc, mdx }
    },
})

export default defineConfig({ collections: [posts] })
