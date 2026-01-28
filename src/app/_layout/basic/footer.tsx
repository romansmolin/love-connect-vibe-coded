import Link from 'next/link'

import { Separator } from '@/shared/ui/separator'

import Logo from './logo'

export const FooterSection = () => {
    return (
        <footer className="w-[90%] md:w-[70%] lg:w-[75%] mx-auto pt-8 lg:pt-22 mb-6" id="footer">
            <div className="p-10 bg-card border border-primary rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
                    <div className="col-span-full xl:col-span-2">
                        <Link className="flex font-bold items-center text-primary p-2 gap-2" href="#">
                            <Logo className="size-12" />
                            <span className="text-xl font-bold">LoveBond</span>
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-lg">Links</h3>
                        <div>
                            <Link className="opacity-60 hover:opacity-100" href="/privacy">
                                Privacy Policy
                            </Link>
                        </div>

                        <div>
                            <Link className="opacity-60 hover:opacity-100" href="/terms-of-conditions">
                                Terms and Conditions
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-lg">Help</h3>
                        <div>
                            <Link className="opacity-60 hover:opacity-100" href="/contact-us">
                                Contact Us
                            </Link>
                        </div>

                        <div>
                            <Link className="opacity-60 hover:opacity-100" href="#faq">
                                FAQ
                            </Link>
                        </div>
                        {/*
                        <div>
                            <Link className="opacity-60 hover:opacity-100" href="#">
                                Feedback
                            </Link>
                        </div> */}
                    </div>
                </div>

                <Separator className="my-6" />
                <section className="">
                    <h3 className="">
                        &copy; 2026 Designed and developed by
                        <Link
                            className="text-primary transition-all border-primary hover:border-b-2 ml-1"
                            href="#"
                            target="_blank"
                        >
                            Roman Smolin
                        </Link>
                    </h3>
                </section>
            </div>
        </footer>
    )
}
