import * as React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { getFileName } from '~/ui/utils/fileUtils'
import { ComponentClass, FunctionComponent } from 'react'
import { useGlobalThemeState } from '../state/theme'

interface Props {
    title?: string
    subtitle?: string

    icon?: string | FunctionComponent<{}> | ComponentClass<{}, any>
    onClick?: () => void
}

export function BrowserCard({ title, subtitle, icon, onClick }: Props) {
    const [accent] = useGlobalThemeState('accent')

    return (
        <motion.div
            style={{
                height: 160,
                minWidth: 240,
                maxWidth: 280,

                overflowWrap: "normal",

                display: 'grid',
                gridTemplateRows: '1fr auto auto',
                gridTemplateColumns: '100%',
                gap: 2,

                boxShadow: "0px 6px 24px -10px rgba(0, 0, 0, 0.25)",
                borderRadius: 16,

                padding: 12,
                boxSizing: "border-box",
                overflow: "hidden",

                backgroundColor: "rgba(255,255,255,0.05)"
            }}

            whileHover={{
                boxShadow: "0px 6px 24px -10px rgba(0, 0, 0, 0.5)",
                y: -8
            }}

            whileTap={{
                y: -4
            }}

            key={title}
            onClick={onClick}
        >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <motion.div style={{ width: 24, height: 24, color: accent}}>
                    {React.createElement(icon) || "peepee" }
                </motion.div>
            </div>
            <div style={{
                fontSize: 14,
                letterSpacing: -0.5,
                lineHeight: 1.2,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>{ title }</div>
            <div style={{
                fontSize: 12,
                letterSpacing: -0.5,
                lineHeight: 1.2,
                opacity: 0.5
            }}>{subtitle}</div>
        </motion.div>
    )
}
