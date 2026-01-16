import React from 'react'

import { GoogleAuthButton } from '@/features/auth'
import { SignUpFormSection } from '@/widgets/auth'

const AuthPage = () => {
    return (
        <div className="w-full">
            <SignUpFormSection thirdPartyAuth={<GoogleAuthButton />} />
        </div>
    )
}

export default AuthPage
