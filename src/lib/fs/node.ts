import { FsNodeType } from '~/lib/fs/navigator'

export class FsNode {
    type: FsNodeType = "file"
    name: string
    children: FsNode[] = []
    parent?: FsNode
    hideFromPath: boolean = false

    getChildByName(name: string) {
        return this.children.find(value => value.name === name)
    }
}