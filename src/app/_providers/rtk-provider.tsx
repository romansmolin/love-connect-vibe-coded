'use client'

import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { store } from '../store'

const RtkProvider = ({ children }: { children: ReactNode }) => {
    return <Provider store={store}>{children}</Provider>
}

export default RtkProvider
