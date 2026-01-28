import Link from 'next/link'

import { SignInForm, SignUpForm } from '@/features/auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const AuthForm = () => {
    return (
        <div className={'flex flex-col gap-6 pt-40 lg:pt-20'}>
            <h1 className="text-2xl text-center font-bold text-primary">Welcome To LoveBond 👋</h1>

            <Tabs className="flex flex-col gap-6 px-10 " defaultValue="sign-in">
                <TabsList className="w-full">
                    <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                    <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="sign-in">
                    <SignInForm />
                </TabsContent>

                <TabsContent value="sign-up">
                    <SignUpForm />
                </TabsContent>
            </Tabs>

            <div className="text-balance text-primary text-center text-xs [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
                By clicking continue, you agree to our{' '}
                <Link className="font-bold underline" href="/terms-of-conditions">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link className="font-bold underline" href="/privacy">
                    Privacy Policy
                </Link>
                .
            </div>
        </div>
    )
}

export default AuthForm
