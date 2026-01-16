import React, { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'

interface GenericCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
    cardContent: ReactNode
    cardContainerClassName?: string

    cardContentClassName?: string
    cardHeader?: ReactNode
    cardFooter?: ReactNode
    cardTitle?: ReactNode
    cardDescription?: ReactNode
}

export const GenericCard = React.forwardRef<HTMLDivElement, GenericCardProps>(
    (
        {
            cardContent,
            cardFooter,
            cardTitle,
            cardDescription,
            cardHeader,
            cardContainerClassName = '',
            cardContentClassName = '',
            className,
            ...cardProps
        },
        ref
    ) => {
        const hasHeaderContent = cardHeader || cardTitle || cardDescription

        return (
            <Card ref={ref} className={cn(cardContainerClassName, className)} {...cardProps}>
                {hasHeaderContent && (
                    <CardHeader className="flex flex-col gap-5">
                        {cardHeader}
                        {cardTitle && <CardTitle>{cardTitle}</CardTitle>}
                        {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
                    </CardHeader>
                )}
                <CardContent className={cn(cardContentClassName)}>{cardContent}</CardContent>
                {cardFooter && <CardFooter>{cardFooter}</CardFooter>}
            </Card>
        )
    }
)

GenericCard.displayName = 'GenericCard'
