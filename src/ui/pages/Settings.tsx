import * as React from 'react'
import { Header } from '../components/Header'
import { Button } from '~/ui/components/input/Button'
import { dispatchTheme, useGlobalThemeState } from '../state/theme'
import { colors } from '~/ui/colors'
import { motion } from 'framer-motion'

interface Props {}

export function SettingsPage(props: Props) {
    const [accent] = useGlobalThemeState('accent')

    return (
        <div>
            <Header>Settings</Header>
            <Button
                type={'default'}
                onClick={() => {
                    dispatchTheme({ type: 'toggle-dark-mode' })
                }}
            >
                Toggle Theme
            </Button>
            <br />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                {Object.keys(colors.themes).map((key) => {
                    return (
                        <>
                            <motion.div
                                style={{
                                    width: 36,
                                    height: 24,
                                    background: colors.themes[key],
                                    borderRadius: 12,
                                    marginRight: 12,
                                }}
                                animate={{
                                    opacity:
                                        colors.themes[key] === accent
                                            ? 1
                                            : 0.33,
                                    scale:
                                        colors.themes[key] === accent
                                            ? 1.25
                                            : 1,
                                }}
                                whileHover={{
                                    opacity: 1,
                                }}
                                onClick={() => {
                                    dispatchTheme({
                                        type: 'set-accent',
                                        accent: colors.themes[key],
                                    })
                                }}
                                transition={{
                                    duration: 0.125
                                }}
                            />
                        </>
                    )
                })}
            </div>
        </div>
    )
}
