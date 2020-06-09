import * as React from 'react'
import { useGlobalThemeState } from '~/ui/state/theme'
import { motion } from 'framer-motion'
import { colors } from '~/ui/colors'

type ButtonType = 'default' | 'primary' | 'warning' | 'danger'

interface Props {
    type: ButtonType
    onClick?: () => void
    children: JSX.Element | string
}

const baseStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    width: 'fit-content',
    height: 'fit-content',
    boxSizing: 'content-box',
    padding: '12px 24px',

    borderRadius: 16,
    boxShadow: '0px 6px 24px -10px rgba(0, 0, 0, 0.0)',

    fontSize: 14,
    letterSpacing: -0.5,
    lineHeight: 1.3,
    fontWeight: 700,
}

export function Button(props: Props) {
    const [accent] = useGlobalThemeState('accent')
    const [isDark] = useGlobalThemeState('dark')

    return (
        <motion.div
            style={{
                ...baseStyle,
                ...calculateStyle(props.type, accent, isDark),
                transition: "color 0.125s, background 0.125s",
                userSelect: 'none'
            }}
            whileHover={{
                boxShadow: '0px 6px 24px -10px rgba(0, 0, 0, 0.25)',
                y: -2
            }}
            whileTap={{
                y: 0
            }}
            onClick={props.onClick}
        >
            {props.children || ''}
        </motion.div>
    )
}

const calculateStyle = (
    type: ButtonType,
    accent: string,
    isDark: boolean
): React.CSSProperties => {
    switch (type) {
        case 'primary': {
            return {
                color: colors.white,
                background: accent,
            }
        }
        case 'warning': {
            return {
                color: colors.pink,
                background: colors.white,
            }
        }
        case 'danger': {
            return {
                color: colors.white,
                background: colors.pink,
            }
        }
        default: {
            return {
                color: accent,
                background: colors.white,
            }
        }
    }
}
