import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { SignInFormSection, SignUpFormSection } from '@/widgets/auth'

const AuthPage = () => {
    return (
        <div className="w-full">
            <div className="flex justify-center mb-6">
                <Tabs className="w-full max-w-lg" defaultValue="sign-up">
                    <TabsList className="inline-flex w-full justify-center gap-2 rounded-lg border py-1">
                        <TabsTrigger className="flex-1" value="sign-up">
                            Sign up
                        </TabsTrigger>
                        <TabsTrigger className="flex-1" value="sign-in">
                            Sign in
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="sign-up">
                        <SignUpFormSection />
                    </TabsContent>

                    <TabsContent value="sign-in">
                        <SignInFormSection />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default AuthPage
