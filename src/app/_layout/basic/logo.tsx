import React from 'react'

import { Logo as HeaderLogo } from '@/widgets/header/ui/logo'

interface LogoProps {
    className?: string
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return <HeaderLogo className={className} />
}

export default Logo
