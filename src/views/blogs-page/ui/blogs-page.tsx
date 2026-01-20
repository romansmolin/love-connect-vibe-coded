import React from 'react'

import { allPosts } from 'content-collections'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'

const getFilenameWithoutExtension = (filename: string) => {
    const extension = 'mdx'

    return filename.split('.').filter((part) => part !== extension)[0]
}

export const BlogsPage = () => {
    const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, max)}...` : value)

    return (
        <section className="mt-46 min-h-screen px-4">
            <div className="max-w-4xl mx-auto text-center space-y-2 mb-10">
                <h1 className="text-4xl font-bold text-slate-900">LoveConnect Blog</h1>
                <p className="text-slate-600">
                    Fresh posts on scheduling, growth, and content workflows—curated for busy teams and creators.
                </p>
            </div>

            <div className="grid gap-6 max-w-5xl mx-auto sm:grid-cols-2 lg:grid-cols-3">
                {allPosts.map((post) => (
                    <article
                        key={post._meta.path}
                        className="rounded-2xl flex flex-col h-full border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        <Image
                            alt={post.title}
                            className="w-full object-cover"
                            height={200}
                            src={post.cover || ''}
                            width={300}
                        />

                        <div className="flex-1 p-5">
                            <p className="mt-3 text-lg font-semibold text-slate-900">{truncate(post.title, 49)}</p>
                            <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                                {truncate(post.description, 155)}
                            </p>
                        </div>

                        <div className="p-5 w-full">
                            <Button asChild className="w-full" size={'lg'}>
                                <Link href={`/blog/${getFilenameWithoutExtension(post._meta.fileName)}`}>
                                    Read
                                </Link>
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
