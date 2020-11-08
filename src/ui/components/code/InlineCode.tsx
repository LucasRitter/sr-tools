import * as React from 'react'
import { useGlobalThemeState } from '~/ui/state/theme'

interface Props {
    children: JSX.Element | string
    style?: React.CSSProperties
    onClick?: () => void
}

export function InlineCode({ children, style, onClick }: Props) {
    const [isDark] = useGlobalThemeState('dark')

    return (
        <span
            style={{
                padding: '4px 8px',
                margin: '0 4px',
                fontFamily: '"DM Mono", monospace',
                background:
                    style?.background ||
                    (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                borderRadius: 4,
                color: style?.color,
            }}
            onClick={onClick}
        >
            {children}
        </span>
    )
}
