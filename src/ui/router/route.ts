import * as React from 'react'

export interface Route {
    path: string
    exact: boolean
    component: React.ComponentType
    icon: React.ComponentType
}
