import React from 'react'

import Link from 'next/link'

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-background mt-28">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="prose prose-lg max-w-none">
                    <h1 className="text-4xl font-bold mb-8 text-center">LoveBond Terms and Conditions</h1>

                    <p className="text-muted-foreground mb-8 text-center">
                        <strong>Effective date:</strong> 10.09.2026
                    </p>

                    <div className="space-y-8">
                        <section>
                            <p className="mb-6">
                                Welcome to LoveBond, a dating service that helps people discover compatible
                                profiles, communicate, and exchange digital gifts. By accessing or using LoveBond
                                (the &quot;Service&quot;), you agree to be bound by the following Terms and
                                Conditions (&quot;Terms&quot;). If you do not agree with these Terms, please do not
                                use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">1. Accounts and Eligibility</h2>

                            <h3 className="text-xl font-medium mb-3">Account Registration</h3>
                            <p className="mb-4">
                                To use LoveBond, you must create an account with accurate and up-to-date
                                information. You are responsible for maintaining the confidentiality of your
                                account credentials and for all activities that occur under your account. You must
                                promptly notify us of any unauthorized use or security breach of your account.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Eligibility</h3>
                            <p>
                                You must be at least 18 years old to use LoveBond. The Service is available
                                worldwide, but you are responsible for ensuring that your use complies with local
                                laws and regulations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">
                                2. Plans, Payments, and Subscription Terms
                            </h2>

                            <p className="mb-4">
                                LoveBond may offer free features and paid in-app credit packages. Credits are used
                                for eligible in-app actions, including digital gifts.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Fees and Charges</h3>
                            <p className="mb-4">
                                Some features of the Service require payment. You will have the opportunity to
                                review and accept any fees before they are charged. Prices may vary by plan and are
                                posted on our website. All fees are in euros unless otherwise indicated, and are
                                non-refundable, except as required by law or expressly allowed by these Terms.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Subscription Renewals</h3>
                            <p className="mb-4">
                                If you subscribe to a paid plan, your subscription will automatically renew at the
                                end of each billing cycle (monthly or annually, as applicable) unless you cancel
                                beforehand. By providing a payment method, you authorize LoveBond to charge the
                                applicable subscription fees to your payment method on a recurring basis. You may
                                cancel your subscription at any time via your account settings or by contacting
                                support; cancellation will stop future charges but will not retroactively refund
                                current charges.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Plan Changes</h3>
                            <p>
                                We reserve the right to modify our plans or pricing. If we change the price of your
                                plan, we will notify you in advance, and the new price will apply at the start of
                                the next billing period. Promotional or special pricing may be offered to others;
                                unless offered to you, such promotions do not apply to your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">3. Use of the Service</h2>

                            <h3 className="text-xl font-medium mb-3">Profiles and User Content</h3>
                            <p className="mb-4">
                                You may create a profile, upload photos, and communicate with other members through
                                LoveBond. You retain ownership of the content you submit. You grant LoveBond a
                                limited license to host, display, and transmit that content as needed to operate,
                                maintain, and improve the Service.
                            </p>

                            <h3 className="text-xl font-medium mb-3">User Responsibilities</h3>
                            <p className="mb-4">
                                You agree to use LoveBond only for lawful purposes and in compliance with these
                                Terms and all applicable laws.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Prohibited Conduct</h3>
                            <p className="mb-4">You must not use the Service to do any of the following:</p>

                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li>
                                    <strong>Violations of Rights or Law:</strong> Post or share any content that
                                    infringes or violates someone else&apos;s rights (including intellectual
                                    property rights, privacy, or publicity rights) or that violates any law or
                                    regulation.
                                </li>
                                <li>
                                    <strong>Offensive or Harmful Content:</strong> Post content that is defamatory,
                                    threatening, harassing, or hateful; content that constitutes hate speech,
                                    encourages violence, or is otherwise extremist in nature; content that is
                                    obscene, pornographic, or exploitative (including content that sexually
                                    exploits minors).
                                </li>
                                <li>
                                    <strong>Fraudulent or Misleading Activities:</strong> Use the Service to
                                    impersonate any person or entity, or submit content that is intentionally
                                    false, misleading, or deceptive (including phishing or scamming).
                                </li>
                                <li>
                                    <strong>Spam and Unsolicited Messaging:</strong> Send unsolicited or bulk
                                    messages, spam, or engage in tactics that violate applicable anti-spam laws.
                                </li>
                                <li>
                                    <strong>Malware and Hacking:</strong> Upload or transmit any viruses, worms,
                                    malware, or any other code that is malicious or technologically harmful.
                                    Attempt to probe, scan, or test the vulnerability of any system or network, or
                                    breach any security or authentication measures of the Service.
                                </li>
                                <li>
                                    <strong>Circumventing Limits:</strong> Use the Service in a manner that exceeds
                                    usage limits or quotas of your plan (e.g., creating multiple accounts to bypass
                                    plan restrictions). You also must not attempt to reverse engineer, decompile,
                                    or otherwise tamper with the Service&apos;s software or features.
                                </li>
                            </ul>

                            <p className="mb-4">
                                Violation of any of the above may result in immediate suspension or termination of
                                your LoveBond account (see Termination below), and may also expose you to legal
                                consequences.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Media Upload Guidelines</h3>
                            <p className="mb-4">
                                To protect members and keep the Service reliable, uploaded photos must follow these
                                guidelines:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mb-4">
                                <li>
                                    <strong>Supported formats:</strong> PNG, JPG, JPEG, and WebP.
                                </li>
                                <li>
                                    <strong>Maximum file size:</strong> 50&nbsp;MB per photo.
                                </li>
                                <li>
                                    <strong>Ownership and safety:</strong> You must have the right to distribute
                                    every asset you upload, and the files cannot contain malware, hidden code, or
                                    any material that violates the Acceptable Use rules described above.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>

                            <h3 className="text-xl font-medium mb-3">Our Intellectual Property</h3>
                            <p className="mb-4">
                                LoveBond (including our software, website, and all content we create, such as text,
                                graphics, logos, and compilations) is protected by intellectual property laws. We
                                grant you a limited, revocable, non-exclusive, non-transferable license to use
                                LoveBond for its intended purpose, subject to these Terms. You may not copy,
                                distribute, modify, or create derivative works from our Service except as
                                explicitly allowed by us or by law. All LoveBond trademarks, logos, and service
                                marks are our property, and you may not use them without our prior written consent.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Your Intellectual Property</h3>
                            <p>
                                You retain all rights to the content you create and upload to LoveBond (your
                                &quot;User Content&quot;). LoveBond does not claim ownership of your User Content.
                                By submitting content through our Service, you grant LoveBond the right to store,
                                transmit, and display it solely as needed to provide the Service. This license is
                                worldwide, non-exclusive, and royalty-free, and it ends when you delete the content
                                from our systems or terminate your LoveBond account. Please ensure you have the
                                necessary rights to any content you upload, including permissions for copyrighted
                                material.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">5. Privacy</h2>
                            <p>
                                Your privacy is very important to us. Our collection and use of personal
                                information through LoveBond is explained in our Privacy Policy. By using the
                                Service, you agree that we can collect and use your information in accordance with
                                the Privacy Policy. We strive to follow applicable privacy requirements, including
                                honoring valid requests to access or delete personal data. For details, please
                                review our Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">
                                6. Disclaimers and Limitations of Liability
                            </h2>

                            <h3 className="text-xl font-medium mb-3">Service &quot;As Is&quot;</h3>
                            <p className="mb-4">
                                LoveBond is provided on an &quot;as is&quot; and &quot;as available&quot; basis.
                                While we aim for high reliability and accuracy, we do not guarantee that the
                                Service will be uninterrupted, error-free, or meet all of your expectations. We
                                disclaim all warranties, express or implied, including any implied warranties of
                                merchantability, fitness for a particular purpose, and non-infringement.
                            </p>

                            <h3 className="text-xl font-medium mb-3">Limitation of Liability</h3>
                            <p>
                                To the fullest extent permitted by law, in no event will LoveBond or its parent
                                company, affiliates, officers, employees, or agents be liable for any indirect,
                                incidental, special, consequential, or punitive damages, or any loss of profits or
                                revenues, whether incurred directly or indirectly, or any loss of data, use,
                                goodwill, or other intangible losses, resulting from (a) your access to or use of
                                or inability to access or use the Service; (b) any conduct or content of another
                                user on or via the Service, including illegal conduct; (c) any content obtained
                                from the Service; or (d) unauthorized access, use, or alteration of your
                                transmissions or content. In no case shall the aggregate liability of LoveBond to
                                you exceed the amount that you paid us (if any) for the Service in the six months
                                immediately preceding the event giving rise to the claim. Some jurisdictions do not
                                allow the exclusion or limitation of certain damages, so some of these limitations
                                may not apply to you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">7. Indemnification</h2>
                            <p>
                                You agree to indemnify, defend, and hold harmless LoveBond and its affiliates, and
                                each of their respective officers, directors, agents, and employees, from any and
                                all claims, liabilities, damages, losses, and expenses (including reasonable
                                attorneys&apos; fees and costs) arising out of or in any way connected with: (a)
                                your access to or use of the Service, including your User Content; (b) your
                                violation of any of these Terms; (c) your violation of another person&apos;s
                                rights, including intellectual property, confidentiality, or privacy rights; or (d)
                                your violation of any laws, rules, or regulations in connection with your use of
                                LoveBond. We reserve the right to assume the exclusive defense and control of any
                                matter otherwise subject to indemnification by you (at your expense), and you agree
                                to cooperate with our defense of such claim.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>

                            <h3 className="text-xl font-medium mb-3">By You</h3>
                            <p className="mb-4">
                                You may stop using LoveBond and/or close your account at any time. If you wish to
                                delete your account and all associated data, you can do so through the account
                                settings or by contacting customer support. Closing your account will terminate
                                your license to use the Service, but the Terms related to Intellectual Property,
                                Disclaimers, Limitation of Liability, and Indemnification (and any other provisions
                                that by their nature should survive) will survive termination.
                            </p>

                            <h3 className="text-xl font-medium mb-3">By Us</h3>
                            <p>
                                We reserve the right to suspend or terminate your access to LoveBond at any time,
                                with or without notice, for any of the following reasons: (i) if you breach these
                                Terms or our Privacy Policy; (ii) if you engage in prohibited conduct; (iii) if
                                required by law enforcement or government request; or (iv) for any other reason in
                                our sole discretion (for example, if continued service to you is no longer
                                commercially viable). In most cases of minor violations, we will attempt to provide
                                a warning or an opportunity to remedy the issue before termination, but we are not
                                obligated to do so.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">9. Changes to These Terms</h2>
                            <p>
                                We may update or modify these Terms from time to time. If a revision is material,
                                we will provide at least 30 days&apos; notice via email or by posting a notice on
                                our site prior to the new terms taking effect, except in urgent cases where changes
                                are required to comply with law or address newly emerged risks. The notice will
                                indicate the effective date of the updated Terms. By continuing to use LoveBond
                                after any changes become effective, you agree to be bound by the revised Terms. If
                                you do not agree to the new Terms, you must stop using the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Disputes</h2>
                            <p className="mb-4">
                                These Terms are governed by the laws of the Czech Republic, without regard to its
                                conflict-of-law rules. This choice of law does not deprive consumers in the
                                European Union of mandatory protections that apply in their country of residence.
                            </p>
                            <p className="mb-4">
                                We encourage you to contact support first so we can try to resolve any complaint
                                informally. If a dispute cannot be resolved, it may be brought before the competent
                                courts of the Czech Republic. EU consumers retain the right to bring proceedings in
                                the courts available under mandatory consumer-protection law in their country of
                                residence.
                            </p>
                            <p>
                                Nothing in this section limits any non-waivable right to use an applicable
                                alternative dispute-resolution body or an online dispute-resolution process where
                                required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
                            <p>
                                If you have any questions or concerns about these Terms and Conditions, you can
                                contact us at:
                            </p>
                            <div className="bg-muted p-4 rounded-lg mt-4">
                                <p className="font-medium">LoveBond Support</p>
                                <p>Email: support@love-bond.com</p>
                                <p>Rix RB s.r.o.</p>
                                <p>IČO: 23715189</p>
                                <p>Sinkulova 160/16, Praha 4–Podolí</p>
                                <p>147 00, Czech Republic</p>
                                <p>
                                    Website:{' '}
                                    <Link className="text-blue-600 hover:underline" href="/">
                                        www.love-bond.com
                                    </Link>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TermsAndConditions
