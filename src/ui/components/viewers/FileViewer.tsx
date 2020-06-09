import * as React from "react"
import { FsNode } from '~/lib/fs/node'

export function FileViewer({node}: {node: FsNode}) {
    return <h1>{node.name}</h1>
}