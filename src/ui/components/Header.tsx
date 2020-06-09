import * as React from 'react'
import { motion } from 'framer-motion'
import { useGlobalThemeState } from '~/ui/state/theme'

interface Props {
    accent?: boolean
    children: JSX.Element | string

    onClick?: () => void
}

export function Header({ accent, children, onClick }: Props) {
    const [accentColor] = useGlobalThemeState('accent')

    return (
        <div
            style={{
                color: accent ? accentColor : undefined,
                fontSize: 20,
                letterSpacing: -0.75,
                lineHeight: 1.2,
                fontWeight: 800,
                marginBottom: 8,

                transition: "color 0.125s"
            }}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
