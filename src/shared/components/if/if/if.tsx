import React from 'react'

interface IfProps {
    condition: boolean
    children: React.ReactNode
    fallback?: React.ReactNode
}

export const If: React.FC<IfProps> = ({ condition, children, fallback = null }) => {
    if (condition) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
