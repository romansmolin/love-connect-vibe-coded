import React, { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/dialog'

interface GenereicDialogProps {
    dialogTriggerComp?: ReactNode
    dialogContent: ReactNode
    dialogHeaderTitle: string
    dialogHeaderDescription: string
    dialogFooter?: ReactNode
    className?: string
    dialogOpen?: boolean
    onDialogOpenChange?: (isOpen: boolean) => void
}

export const GenericDialog = ({
    dialogTriggerComp,
    dialogContent,
    dialogFooter,
    dialogHeaderTitle,
    dialogHeaderDescription,
    className = '',
    dialogOpen,
    onDialogOpenChange,
}: GenereicDialogProps) => {
    return (
        <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
            {dialogTriggerComp && <DialogTrigger asChild>{dialogTriggerComp}</DialogTrigger>}

            <DialogContent className={cn('w-[98%] max-h-[90%] overflow-y-scroll xs:w-[unset]', className)}>
                <DialogHeader>
                    <DialogTitle className="text-2xl">{dialogHeaderTitle}</DialogTitle>
                    <DialogDescription className="text-justify mt-2.5">
                        {dialogHeaderDescription}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex pt-4 max-w-[100%] overflow-hidden">{dialogContent}</div>

                {dialogFooter && <DialogFooter>{dialogFooter}</DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}
