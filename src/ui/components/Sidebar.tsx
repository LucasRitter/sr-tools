import * as React from 'react'
import styled from 'styled-components'
import theme from 'styled-theming'
import { useLocation, Link, LinkProps, useRouteMatch } from 'react-router-dom'
import { IconMenthe } from '~/ui/components/icons/Menthe'
import { colors } from '../colors'
import { useGlobalThemeState } from '../state/theme'
import { motion } from 'framer-motion'
import { IconSettings } from './icons/Settings'
import { IconCompass } from './icons/Compass'
import { useGeneralGlobalState as useGlobalGeneralState } from '../state/general'
import { IconCube } from '~/ui/components/icons/Cube'
import { useNavigatorGlobalState } from '~/ui/state/navigation'

interface Props {}

export function Sidebar(props: Props) {
    const location = useLocation()
    const [root] = useNavigatorGlobalState('root')

    return (
        <Container>
            <div>
                <SidebarIcon to={'/'}>
                    <IconMenthe />
                </SidebarIcon>
            </div>
            <CentralIcons>
                <SidebarIcon to={'/browser'} disabled={!root}>
                    <IconCompass />
                </SidebarIcon>
                <SidebarIcon to={'/repack'} disabled={!root}>
                    <IconCube />
                </SidebarIcon>
            </CentralIcons>
            <div>
                <SidebarIcon to={'/settings'}>
                    <IconSettings />
                </SidebarIcon>
            </div>
        </Container>
    )
}

const Container = styled.div`
    padding: 24px;
    box-sizing: content-box;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
`

const CentralIcons = styled.div`
    &>* {
        margin: 12px 0;
    }
`

interface SidebarIconProps {
    disabled?: boolean
}

export function SidebarIcon(props: LinkProps & SidebarIconProps) {
    const match = useRouteMatch({
        path: props.to.toString(),
        exact: true,
    })

    const [isDark] = useGlobalThemeState('dark')
    const [accent] = useGlobalThemeState('accent')

    return (
        <motion.div
            style={{
                width: 24,
                height: 24,
                textDecoration: 'none',
            }}
            animate={{
                color: match ? accent : isDark ? colors.white : colors.darkGrey,
                opacity: match ? 1 : 0.33,
            }}
            transition={{ duration: 0.125 }}
            whileHover={{
                opacity: props.disabled ? 0.5 : 1,
                color: accent,
            }}
        >
            {props.disabled ? (
                <div>{props.children}</div>
            ) : (
                <Wrapper {...props} to={props.disabled ? null : props.to} />
            )}
        </motion.div>
    )
}

const Wrapper = styled(Link)`
    color: inherit;
    text-decoration: none;
    &:visited {
        color: inherit;
    }
`
