import * as React from 'react'
import { Route as ReactRoute, Switch } from 'react-router'
import { HomePage } from '~/ui/pages/Home'
import { Button } from '../components/input/Button'
import { SettingsPage } from '../pages/Settings'
import { ViewerPage } from '../pages/Viewer'
import { Route } from './route'
import { RepackPage } from '~/ui/pages/Repack'
import { TexturesPage } from '~/ui/pages/Textures'

type RouteKeys = 'home' | 'browser' | 'models' | 'textures' | 'settings'

export const routes: { [key in RouteKeys]: Route } = {
    home: {
        path: '/',
        exact: true,
        component: HomePage,
        icon: Button,
    },
    browser: {
        path: '/browser',
        exact: true,
        component: ViewerPage,
        icon: Button,
    },
    models: {
        path: '/repack',
        exact: true,
        component: RepackPage,
        icon: Button,
    },
    textures: {
        path: '/textures',
        exact: true,
        component: TexturesPage,
        icon: Button,
    },
    settings: {
        path: '/settings',
        exact: true,
        component: SettingsPage,
        icon: Button,
    },
}

function generateRoutes() {
    const content = []
    for (let key in routes) {
        const route: Route = routes[key]
        content.push(<ReactRoute key={key} {...route} />)
    }
    return content
}

export function Routes() {
    return <Switch>{...generateRoutes()}</Switch>
}
