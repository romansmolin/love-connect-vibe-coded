import type { MetadataRoute } from 'next'

import { allPosts } from 'content-collections'

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://zapshipr.com').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date().toISOString()

    const landingPage: MetadataRoute.Sitemap[0] = {
        url: `${baseUrl}/`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1,
    }

    const blogPages: MetadataRoute.Sitemap = allPosts.map((post) => ({
        url: `${baseUrl}/blog/${post._meta.path}`,
        lastModified: post.pubDate ?? now,
        changeFrequency: 'weekly',
        priority: 0.6,
    }))

    return [landingPage, ...blogPages]
}

