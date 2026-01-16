import { withContentCollections } from '@content-collections/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    compress: true,
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: '/',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=0, s-maxage=600, stale-while-revalidate=60',
                    },
                ],
            },
        ]
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: [
            'res.cloudinary.com',
            'flagcdn.com',
            'i.pravatar.cc',
            'placehold.co',
            'easy-resta-s3-bucket.s3.eu-north-1.amazonaws.com',
            'easy-post.s3.amazonaws.com',
            'images.pexels.com',
            'www.pexels.com',
            'p16-pu-sign-no.tiktokcdn-eu.com',
            'media.licdn.com',
            'p16-sign-va.tiktokcdn.com',
            'images.unsplash.com',
            'cdn.shadcnstudio.com',
        ],
    },
}

export default withContentCollections(nextConfig)
