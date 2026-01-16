import { HeartPulse } from 'lucide-react'

import AnimatedContent from '@/shared/ui/AnimatedContent'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'

const testimonials = [
    {
        id: 1,
        name: 'Lukas Meyer',
        designation: 'Product Designer',
        company: 'Freelance',
        testimonial:
            'LoveConnect feels refreshingly real. I matched with people who actually shared my interests, and the conversations didn’t fizzle after two messages.',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    },
    {
        id: 2,
        name: 'Amira Khan',
        designation: 'Social Media Manager',
        company: 'Insight Agency',
        testimonial:
            'The vibe on LoveConnect is so much more respectful than other apps. I love how easy it is to start a genuine conversation from someone’s profile.',
        avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
    },
    {
        id: 3,
        name: 'Mateo Rossi',
        designation: 'Startup Founder',
        company: 'DesignPro Studio',
        testimonial:
            'I’m busy and don’t want to waste time swiping endlessly. LoveConnect helped me find solid matches quickly — and I actually went on great dates.',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    {
        id: 4,
        name: 'Clara Jensen',
        designation: 'Marketing Specialist',
        company: 'BrandBoost',
        testimonial:
            'LoveConnect’s matching feels thoughtful. I met someone who shares my values, and it’s the first app that made dating feel fun again.',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    },
    {
        id: 5,
        name: 'Diego Fernández',
        designation: 'Freelance Videographer',
        company: 'CodeCrafters Media',
        testimonial:
            'Best dating app decision I’ve made. The profiles feel authentic, and the safety features gave me confidence meeting up in real life.',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    },
    {
        id: 6,
        name: 'Elena Petrova',
        designation: 'Product Manager',
        company: 'InnovateX',
        testimonial:
            'LoveConnect is clean, easy to use, and genuinely focused on connection. I appreciate the quality of matches — fewer swipes, better conversations.',
        avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    },
]

export const Testimonials02 = () => (
    <section className="flex justify-center items-center px-6 py-10 md:py-14" id="testimonials">
        <div>
            <h2 className="mb-14 text-5xl md:text-6xl font-bold text-center tracking-wide font-pacifico text-primary">
                Testimonials
            </h2>
            <div className="max-w-screen-xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-8">
                {testimonials.map((testimonial) => (
                    <AnimatedContent key={testimonial.id}>
                        <div className="relative mb-8 border border-dashed border-primary rounded-xl p-6 break-inside-avoid">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback className="text-xl font-medium bg-primary text-primary-foreground">
                                            {testimonial.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-lg font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.designation}</p>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <HeartPulse className="animate-pulse size-8 text-primary" />
                                </div>
                            </div>
                            <p className="mt-5 text-[17px]">{testimonial.testimonial}</p>
                        </div>
                    </AnimatedContent>
                ))}
            </div>
        </div>
    </section>
)
