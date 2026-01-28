import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Card, CardContent } from '@/shared/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/shared/ui/carousel'
import { Rating } from '@/shared/ui/rating'

export type TestimonialItem = {
    name: string
    role: string
    company: string
    avatar: string
    rating: number
    content: string
}

const testimonials: TestimonialItem[] = [
    {
        name: 'Lukas Meyer',
        role: 'Software Engineer',
        company: 'Tech Corp',
        content:
            'LoveBond changed my life! I met my girlfriend Sarah here 6 months ago. The matching algorithm really understood what I was looking for.',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        rating: 5,
    },
    {
        name: 'Amira Khan',
        role: 'Teacher',
        company: 'Elementary School',
        content:
            'I was skeptical about online dating, but LoveBond made it so easy. I found someone who shares my values and interests. Highly recommend!',
        avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
        rating: 5,
    },
    {
        name: 'Mateo Rossi',
        role: 'Designer',
        company: 'Creative Studio',
        content:
            'The AI matching is incredible. It connected me with people I actually want to talk to. No more wasting time on incompatible matches!',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        rating: 5,
    },
    {
        name: 'Clara Jensen',
        role: 'Marketing Manager',
        company: 'Digital Agency',
        content:
            "I found my perfect match within a month! The compatibility scores are spot-on. We're planning our future together now.",
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        rating: 5,
    },
    {
        name: 'Diego Fernández',
        role: 'Photographer',
        company: 'Freelance',
        content:
            "Best dating app I've tried! The interface is beautiful, and I love how it focuses on meaningful connections rather than just swiping.",
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        rating: 5,
    },
    {
        name: 'Elena Petrova',
        role: 'Doctor',
        company: 'City Hospital',
        content:
            "LoveBond helped me find someone who understands my busy schedule. We've been together for 8 months and couldn't be happier!",
        avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
        rating: 5,
    },
]

export const Testimonials01 = () => {
    return (
        <section className="py-10 md:py-14" id="testimonials">
            <Carousel
                className="mx-auto flex max-w-7xl gap-12 px-4 max-sm:flex-col sm:items-center sm:gap-16 sm:px-6 lg:gap-24 lg:px-8"
                opts={{
                    align: 'start',
                    slidesToScroll: 1,
                }}
            >
                {/* Left Content */}
                <div className="space-y-4 sm:w-1/2 lg:w-1/3">
                    <p className="text-primary text-sm font-medium uppercase">Real customers</p>

                    <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">Success Stories</h2>

                    <p className="text-muted-foreground text-xl">
                        Real couples who found love through LoveBond. Their stories inspire us every day.
                    </p>

                    <div className="flex items-center gap-4">
                        <CarouselPrevious
                            className="disabled:bg-primary/10 disabled:text-primary static translate-y-0 rounded-md disabled:opacity-100"
                            variant="default"
                        />
                        <CarouselNext
                            className="disabled:bg-primary/10 disabled:text-primary static translate-y-0 rounded-md disabled:opacity-100"
                            variant="default"
                        />
                    </div>
                </div>

                {/* Right Testimonial Carousel */}
                <div className="relative max-w-196 sm:w-1/2 lg:w-2/3">
                    <CarouselContent className="sm:-ml-6">
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index} className="sm:pl-6 lg:basis-1/2">
                                <Card className="hover:border-primary h-full transition-colors duration-300">
                                    <CardContent className="space-y-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-10 rounded-full">
                                                <AvatarImage alt={testimonial.name} src={testimonial.avatar} />
                                                <AvatarFallback className="rounded-full text-sm">
                                                    {testimonial.name
                                                        .split(' ', 2)
                                                        .map((n) => n[0])
                                                        .join('')}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <h4 className="font-medium">{testimonial.name}</h4>
                                                <p className="text-muted-foreground text-sm">
                                                    {testimonial.role} at{' '}
                                                    <span className="text-card-foreground font-semibold">
                                                        {testimonial.company}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <Rating
                                            readOnly
                                            precision={0.5}
                                            size={24}
                                            value={testimonial.rating}
                                            variant="yellow"
                                        />
                                        <p>{testimonial.content}</p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </div>
            </Carousel>
        </section>
    )
}
