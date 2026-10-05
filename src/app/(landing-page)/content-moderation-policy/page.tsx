import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Content Moderation Policy | LoveBond',
    description: 'Learn what is allowed on LoveBond and how to report profiles or content.',
}

const ContentModerationPolicy = () => {
    return (
        <div className="mt-28 min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <article className="prose prose-lg max-w-none">
                    <h1 className="mb-4 text-center text-4xl font-bold">Content Moderation Policy</h1>
                    <p className="mb-8 text-center text-muted-foreground">
                        <strong>Effective date:</strong> October 5, 2026
                    </p>

                    <p className="mb-8">
                        LoveBond is a dating service for adults. This policy explains the content and behavior
                        expected in profiles, photos, and conversations, how to report concerns, and the actions we
                        may take. It supplements our <Link href="/terms-of-conditions">Terms and Conditions</Link>{' '}
                        and <Link href="/privacy">Privacy Policy</Link>.
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold">1. Our community standards</h2>
                        <p>
                            Treat other members with respect, be honest about who you are, and only share content
                            you have the right to use. LoveBond is for people aged 18 and older. You may not use
                            the Service to post, send, request, or promote:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                Content involving anyone under 18, including sexualization, grooming, or
                                exploitation of a minor.
                            </li>
                            <li>
                                Non-consensual intimate images, sexually exploitative material, or unwanted sexual
                                harassment.
                            </li>
                            <li>
                                Threats, stalking, bullying, hateful abuse, discrimination, or encouragement of
                                violence or self-harm.
                            </li>
                            <li>
                                Fraud, scams, impersonation, deceptive profiles, phishing, or requests for money or
                                financial credentials under false pretenses.
                            </li>
                            <li>
                                Someone else&apos;s private information or intimate content shared without their
                                permission.
                            </li>
                            <li>
                                Spam, unsolicited promotion, automated or misleading activity, malicious code, or
                                attempts to evade account restrictions.
                            </li>
                            <li>Illegal content or content that infringes another person&apos;s rights.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold">2. Report or block a member</h2>
                        <p>
                            To report a profile, open the member&apos;s profile, select <strong>Report</strong>,
                            choose the closest reason, and include relevant details. The report form accepts
                            reports about fake profiles, inappropriate photos, harassment, spam, underage users,
                            and other concerns. Share enough information for us to identify the issue, but avoid
                            sending unrelated sensitive information.
                        </p>
                        <p>
                            You can select <strong>Block</strong> on a member&apos;s profile to stop seeing one
                            another in Discover or matches. Blocking does not submit a report, so report the member
                            separately if you believe they have broken this policy.
                        </p>
                        <p>
                            If you cannot use the report form or need to report specific content, email{' '}
                            <a href="mailto:support@love-bond.com">support@love-bond.com</a>. Include the profile
                            name or link, where the content appears, and a brief description. For an immediate
                            threat to someone&apos;s safety, contact local emergency services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold">3. How we review reports</h2>
                        <p>
                            We review reports against this policy, our Terms and Conditions, and applicable law. We
                            consider the reported content, surrounding context, the seriousness of the concern, and
                            any relevant pattern of behavior. We may request additional information when needed.
                        </p>
                        <p>
                            Depending on the circumstances, we may remove or restrict content, limit account
                            features, issue a warning, suspend an account, or close it. We may act without advance
                            notice when necessary to protect members or comply with law. Where legally required, we
                            may preserve or share relevant information with competent authorities.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold">4. Decisions and requests for review</h2>
                        <p>
                            If we restrict your content or account, we will provide the reason for the decision
                            where required by law and where we are permitted to do so. If you believe we made a
                            mistake, reply to the notice you received or contact{' '}
                            <a href="mailto:support@love-bond.com">support@love-bond.com</a>. Include your
                            username, the decision, and why you believe it should be reviewed. We will consider the
                            information and may uphold, change, or reverse the decision.
                        </p>
                        <p>
                            This process does not limit any rights or remedies available to you under applicable
                            law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">5. Privacy and misuse of reports</h2>
                        <p>
                            We handle information submitted in reports in accordance with our{' '}
                            <Link href="/privacy">Privacy Policy</Link> and applicable law. Do not submit false or
                            deliberately misleading reports, or use reporting tools to harass another member.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    )
}

export default ContentModerationPolicy
