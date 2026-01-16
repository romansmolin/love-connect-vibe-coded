import Link from 'next/link'

import Logo from './logo'

interface MenuItem {
    title: string
    links: {
        text: string
        url: string
    }[]
}

interface Footer2Props {
    logo?: {
        url: string
        src: string
        alt: string
        title: string
    }
    tagline?: string
    menuItems?: MenuItem[]
    copyright?: string
    bottomLinks?: {
        text: string
        url: string
    }[]
}

const Footer2 = ({
    logo = {
        src: '',
        alt: 'OrbitReach logo',
        title: 'OrbitReach',
        url: '/',
    },
    tagline = 'Publish everywhere. Stay in orbit.',
    menuItems = [
        {
            title: 'Product',
            links: [
                { text: 'Overview', url: '/' },
                { text: 'Features', url: '#features' },
                { text: 'Platforms', url: '#platform' },
                { text: 'Pricing', url: '#pricing' },
                { text: 'Testimonials', url: '#testimonials' },
            ],
        },
        {
            title: 'Company',
            links: [
                { text: 'About', url: '/#' },
                { text: 'Blog', url: '/blog' },
                { text: 'Contact', url: '/contact-us' },
                { text: 'Careers', url: '/#' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { text: 'Help Center', url: '/contact-us' },
                { text: 'FAQ', url: '#faq' },
                { text: 'Status', url: '/#' },
            ],
        },
        {
            title: 'Social',
            links: [
                { text: 'Twitter', url: '/#' },
                { text: 'Instagram', url: '/#' },
                { text: 'LinkedIn', url: '/#' },
            ],
        },
    ],
    copyright = '© 2025 OrbitReach. All rights reserved.',
    bottomLinks = [
        { text: 'Terms and Conditions', url: '/terms-of-conditions' },
        { text: 'Privacy Policy', url: '/privacy' },
    ],
}: Footer2Props) => {
    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <footer className="rounded-3xl border border-primary/20 bg-card/60 p-8 backdrop-blur md:p-12">
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
                        <div className="col-span-2 mb-8 lg:mb-0">
                            <div className="flex items-center gap-2 lg:justify-start">
                                <Link className="flex items-center gap-3 text-foreground" href={logo.url}>
                                    <Logo className="h-12 w-12" />
                                    <span className="text-xl font-semibold">{logo.title}</span>
                                </Link>
                            </div>
                            <p className="mt-4 text-base font-semibold text-muted-foreground">{tagline}</p>
                        </div>
                        {menuItems.map((section) => (
                            <div key={section.title}>
                                <h3 className="mb-4 text-base font-bold text-foreground">{section.title}</h3>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {section.links.map((link) => (
                                        <li key={link.text} className="font-medium hover:text-primary">
                                            <Link href={link.url}>{link.text}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-sm font-medium text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <p>{copyright}</p>
                        <ul className="flex flex-wrap gap-4">
                            {bottomLinks.map((link) => (
                                <li key={link.text} className="hover:text-primary underline decoration-1">
                                    <Link href={link.url}>{link.text}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </footer>
            </div>
        </section>
    )
}

export default Footer2
