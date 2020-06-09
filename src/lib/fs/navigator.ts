import { FsNode } from '~/lib/fs/node'
import { FileSystemDirectoryHandle } from '~/lib/nativefs/handle'
import { DirectoryNode } from '~/lib/fs/directoryNode'

export type FsNodeType = "node" | "directory" | "packfileContainer" | "file"

export class FsNodeNavigator {
    root: FsNode
    path: FsNode[] = []

    private constructor() {

    }

    static async fromDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<FsNodeNavigator> {
        const nav = new FsNodeNavigator()
        nav.root = await DirectoryNode.from(handle, undefined, true)

        return nav
    }

    get current() {
        if (this.path.length === 0) {
            return this.root;
        }
        else {
            return this.path[this.path.length - 1]
        }
    }

    get pathNames() {
        return this.path.map(node => node.name)
    }
}

