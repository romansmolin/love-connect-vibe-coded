import React from 'react'

const ReturnPolicy = () => {
    return (
        <div className="min-h-screen bg-background mt-28">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="prose prose-lg max-w-none">
                    <h1 className="text-4xl font-bold mb-8 text-center">LoveBond Return Policy</h1>

                    <p className="text-muted-foreground mb-8 text-center">
                        <strong>Last Updated:</strong> 11.09.2026
                    </p>

                    <div className="space-y-8">
                        <section>
                            <p className="mb-6">
                                This Return Policy explains how refunds and credits are handled for LoveBond
                                purchases. By purchasing credits or subscriptions, you agree to the terms below.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">1. Digital Credits</h2>
                            <p className="mb-4">
                                Credits are digital goods delivered instantly after payment confirmation. Once
                                credits are added to your wallet, the purchase is generally non-refundable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">2. Failed or Duplicate Charges</h2>
                            <p className="mb-4">
                                If you are charged but do not receive credits, or if you are charged more than once
                                for the same purchase, contact our support team within 14 days. We will investigate
                                and issue a refund or credit where appropriate.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">3. Subscription Refunds</h2>
                            <p className="mb-4">
                                Subscription fees are billed in advance. Refunds are not guaranteed and are
                                assessed on a case-by-case basis for billing errors or service outages.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">4. How to Request a Refund</h2>
                            <p className="mb-4">
                                Send your request to support with your account email, transaction date, and a brief
                                description of the issue. We aim to respond within 5 business days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
                            <p className="mb-4">
                                If you have questions about this Return Policy, please reach out via the contact
                                form on our website.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReturnPolicy
