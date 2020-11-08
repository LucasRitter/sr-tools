import * as React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { FileSystemHandle } from '~/lib/nativefs/handle'
import { NativeFsWarning } from '~/ui/components/NativeFsWarning'
import { hasNativeFs } from '~/lib/nativefs/hasNativeFs'
import { AnimatePresence, motion } from 'framer-motion'
import { colors } from '~/ui/colors'
import { Sidebar } from '~/ui/components/Sidebar'
import { useGlobalThemeState } from './ui/state/theme'
import { Routes } from '~/ui/router/routes'
import { getChromeVersion } from '~/ui/utils/chromeVersion'

declare global {
    interface FilePickerOptions {
        types?: {
            description: string,
            accept: {[key: string]: [string]}
        }[],
        excludeAcceptAllOption?: boolean
    }

    interface Window {
        // Outdated, Chrome <85
        // chooseFileSystemEntries: (options?: {
        //     type: 'open-file' | 'save-file' | 'open-directory'
        // }) => Promise<FileSystemHandle>

        showOpenFilePicker(options?: { multiple?: boolean } & FilePickerOptions),
        showSaveFilePicker(options?: FilePickerOptions),
        showDirectoryPicker()
    }
}

interface Props {}

export function App() {
    if (!hasNativeFs()) {
        return <NativeFsWarning />
    }

    if (getChromeVersion() < 85) {
        return <p>This app requires Chrome 85+</p>
    }

    const [isDark] = useGlobalThemeState('dark')
    const [accent] = useGlobalThemeState('accent')

    return (
        <ThemeProvider
            theme={{ mode: isDark ? 'dark' : 'light', accent: accent }}
        >
            <Background />
            <motion.div
                style={{
                    display: 'grid',
                    gridTemplateRows: '100%',
                    gridTemplateColumns: '100%',
                    width: '100vw',
                    height: '100vh',
                    color: isDark ? colors.white : colors.darkGrey,
                    overflow: 'hidden'
                }}
            >
                <BrowserRouter>
                    <Route
                        render={({ location }) => (
                            <Container>
                                <Sidebar />
                                <div style={{height:'1fr', overflowY: 'scroll', padding: 24}}><AnimatePresence exitBeforeEnter>
                                    <Routes />
                                </AnimatePresence></div>
                            </Container>
                        )}
                    />
                </BrowserRouter>
            </motion.div>
        </ThemeProvider>
    )
}

const Container = styled.div`
    width: 1fr;
    height: 1fr;

    display: grid;
    grid-template-columns: 72px 1fr;
    grid-template-rows: 100%;

    box-sizing: content-box;
`

export function Background({ children }: { children?: React.ReactChildren }) {
    const [isDark] = useGlobalThemeState('dark')

    return (
        <motion.div
            style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -1,
                overflow: 'hidden'
            }}
            initial={{
                background: 'linear-gradient(150deg, #ffffff 0%, #ffffff 100%)',
            }}
            animate={{
                background: `linear-gradient(150deg, ${
                    isDark ? colors.superDarkGrey : colors.white
                } 0%, ${isDark ? colors.ultraDarkGrey : '#e8edf6'} 100%)`,
            }}
            transition={{
                duration: 1,
            }}
        >
            {children}
        </motion.div>
    )
}
