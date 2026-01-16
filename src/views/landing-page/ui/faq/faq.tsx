import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'

interface FAQProps {
    question: string
    answer: string
    value: string
}

const FAQList: FAQProps[] = [
    {
        question: 'Do you offer a free plan?',
        answer: 'Yes — OrbitReach includes a forever-free plan with all essential features for creators. No credit card required.',
        value: 'item-1',
    },
    {
        question: 'Which platforms are supported?',
        answer: 'Instagram, LinkedIn, Threads, Pinterest, Bluesky, and Facebook. YouTube and TikTok support is coming soon.',
        value: 'item-2',
    },
    {
        question: 'What counts as a connected account?',
        answer: 'Each individual social profile you connect (e.g., one Instagram profile or one Facebook Page) counts as one connected account.',
        value: 'item-3',
    },
    {
        question: 'Can I connect multiple accounts from the same platform?',
        answer: 'Yes. You can connect multiple profiles per platform, as long as you stay within your plan limits.',
        value: 'item-4',
    },
    {
        question: 'Is there a limit on how many posts I can schedule?',
        answer: 'Yes — OrbitReach uses generous scheduling and publishing limits to protect your accounts from platform blocks or throttling. These limits are designed to feel unlimited for normal use while staying within safe API boundaries.',
        value: 'item-5',
    },
    {
        question: 'Do you support carousel posts and videos?',
        answer: 'Yes — wherever the platform supports them. Support for additional formats will expand over time.',
        value: 'item-6',
    },
    {
        question: 'How does the AI caption assistant work?',
        answer: 'You enter a prompt or paste an idea — the AI generates multiple caption options. You can fully edit anything before scheduling.',
        value: 'item-7',
    },
    {
        question: 'What is the Draft Library?',
        answer: 'A space to save unfinished posts, reuse high-performers, and keep ideas organized until you’re ready to publish.',
        value: 'item-8',
    },
    {
        question: 'Do you post automatically at the scheduled time?',
        answer: 'Yes — OrbitReach auto-publishes your posts according to your schedule while respecting each platform’s API rules and availability.',
        value: 'item-9',
    },
    {
        question: 'How does billing work for monthly vs yearly?',
        answer: 'Choose monthly or save with yearly billing (40% off). You can switch anytime.',
        value: 'item-10',
    },
    {
        question: 'Can I change plans later?',
        answer: 'Absolutely. You can upgrade or downgrade at any time. Changes apply immediately and are prorated when applicable.',
        value: 'item-11',
    },
    {
        question: 'What kind of support do you provide?',
        answer: 'All users get chat/email support. Pro users receive priority response times.',
        value: 'item-12',
    },
    {
        question: 'Is my data secure?',
        answer: 'Yes. OrbitReach never exposes or stores your tokens in plain form. All authentication stages use secure OAuth flows and encrypted storage. OrbitReach never posts anything without your explicit approval.',
        value: 'item-13',
    },
]

export const FAQSection = () => {
    return (
        <section className="mx-auto md:w-[700px] px-8 sm:px-0" id="faq">
            <div className="text-center mb-8">
                <h2 className="text-lg text-primary text-center mb-2 tracking-wider">FAQS</h2>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-center">
                    Common Questions
                </h2>
            </div>

            <Accordion collapsible className="AccordionRoot flex flex-col gap-5" type="single">
                {FAQList.map(({ question, answer, value }) => (
                    <AccordionItem
                        key={value}
                        className="px-2 py-1 rounded-2xl border-1 border-primary"
                        value={value}
                    >
                        <AccordionTrigger className="text-left text-primary dark:text-white">
                            {question}
                        </AccordionTrigger>

                        <AccordionContent>{answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    )
}
