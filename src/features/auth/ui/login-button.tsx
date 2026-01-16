import { LogIn } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'

export const LoginButton = async () => {
    return (
        <Button
            asChild
            className="flex h-10 items-center gap-2 shadow-lg hover:shadow-xl rounded-xl"
            variant={'outline'}
        >
            <Link aria-label="Open authentication page" href="/auth">
                Get Started
                <LogIn className="size-4" />
            </Link>
        </Button>
    )
}
