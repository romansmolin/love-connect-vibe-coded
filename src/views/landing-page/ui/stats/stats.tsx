import React from 'react'

import CountUp from '@/shared/ui/count-up'

const Stats = () => {
    return (
        <div className="flex items-center justify-center py-10 md:py-14">
            <div className="max-w-screen-xl mx-auto w-full px-6 xl:px-0">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Find love. Build connections.</h2>
                <p className="mt-6 text-lg max-w-2xl text-foreground/70">
                    LoveBond helps you discover meaningful relationships with compatible singles in your area.
                    Chat, meet, and build connections that last.
                </p>

                <div className="mt-16 sm:mt-24 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16 justify-center">
                    <div>
                        <span className="text-5xl md:text-6xl font-bold text-emerald-500">
                            <CountUp
                                className="count-up-text"
                                direction="up"
                                duration={0.6}
                                from={0}
                                separator=","
                                to={3.4}
                                onEnd={undefined}
                                onStart={undefined}
                            />{' '}
                            hours
                        </span>
                        <p className="mt-6 font-semibold text-xl">Matches per week</p>
                        <p className="mt-2 text-[17px] text-muted-foreground">
                            Average number of quality matches for active LoveBond users.
                        </p>
                    </div>

                    <div>
                        <span className="text-5xl md:text-6xl font-bold text-indigo-500">
                            <CountUp
                                className="count-up-text"
                                direction="up"
                                duration={0.6}
                                from={0}
                                separator=","
                                to={50000}
                                onEnd={undefined}
                                onStart={undefined}
                            />
                        </span>
                        <p className="mt-6 font-semibold text-xl">Active members</p>
                        <p className="mt-2 text-[17px] text-muted-foreground">
                            Join thousands of singles looking for meaningful connections.
                        </p>
                    </div>

                    <div>
                        <span className="text-5xl md:text-6xl font-bold text-rose-500">
                            <CountUp
                                className="count-up-text"
                                direction="up"
                                duration={0.15}
                                from={0}
                                separator=","
                                to={12000}
                                onEnd={undefined}
                                onStart={undefined}
                            />
                        </span>
                        <p className="mt-6 font-semibold text-xl">Successful matches</p>
                        <p className="mt-2 text-[17px] text-muted-foreground">
                            Couples who found love through LoveBond and are still together.
                        </p>
                    </div>

                    <div>
                        <span className="text-5xl md:text-6xl font-bold text-blue-500">
                            <CountUp
                                className="count-up-text"
                                direction="up"
                                duration={0.6}
                                from={0}
                                separator=","
                                to={95}
                                onEnd={undefined}
                                onStart={undefined}
                            />
                            %
                        </span>
                        <p className="mt-6 font-semibold text-xl">Match accuracy</p>
                        <p className="mt-2 text-[17px] text-muted-foreground">
                            Our AI-powered algorithm ensures highly compatible matches based on your preferences.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Stats
