'use client'

import React, { ComponentPropsWithoutRef, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { cn } from '../lib/utils'

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
    const animations = {
        initial: { scale: 0.8, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: -20 },
        transition: { type: 'spring', stiffness: 350, damping: 40 },
    }

    return (
        // @ts-ignore
        <motion.div {...animations} className="mx-auto w-full overflow-hidden">
            {children}
        </motion.div>
    )
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<'div'> {
    children: React.ReactNode
    delay?: number
}

export const AnimatedList = React.memo(
    ({ children, className, delay = 1000, ...props }: AnimatedListProps) => {
        const [index, setIndex] = useState(0)
        const childrenArray = useMemo(() => React.Children.toArray(children), [children])

        useEffect(() => {
            if (index < childrenArray.length - 1) {
                const timeout = setTimeout(() => {
                    setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length)
                }, delay)

                return () => clearTimeout(timeout)
            }
        }, [index, delay, childrenArray.length])

        const itemsToShow = useMemo(() => {
            const result = childrenArray.slice(0, index + 1).reverse()
            return result
        }, [index, childrenArray])

        return (
            <div
                className={cn(`flex flex-col items-center gap-2 overflow-hidden`, className)}
                {...props}
            >
                <AnimatePresence>
                    {itemsToShow.map((item) => (
                        <AnimatedListItem key={(item as React.ReactElement).key}>
                            {item}
                        </AnimatedListItem>
                    ))}
                </AnimatePresence>
            </div>
        )
    }
)

AnimatedList.displayName = 'AnimatedList'
