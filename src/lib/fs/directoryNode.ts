import { FileSystemDirectoryHandle, FileSystemHandle } from '~/lib/nativefs/handle'
import { FsNode } from '~/lib/fs/node'
import { FsNodeType } from '~/lib/fs/navigator'
import { dispatchNavigator } from '~/ui/state/navigation'
import { PackfileContainerNode } from '~/lib/fs/packfile/containerNode'

export class DirectoryNode extends FsNode {
    type: FsNodeType = "directory"
    directory: FileSystemDirectoryHandle = undefined
    populated: boolean = false

    static async from(handle: FileSystemDirectoryHandle, parent: FsNode, autoPopulate: boolean = false): Promise<DirectoryNode> {
        const node = new DirectoryNode()
        node.name = handle.name
        node.directory = handle
        node.parent = parent

        if (autoPopulate) {
            await node.populateChildren()
        }

        return node
    }

    async populateChildren() {
        const children: FsNode[] = []



        for await (let entry of this.directory.getEntries()) {
            const date = Date.now()
            const type = DirectoryNode.mapChildType(entry)

            switch (type) {
                case 'directory':
                    if (!entry.isDirectory)
                        throw new Error("")
                    children.push(await DirectoryNode.from(entry, this, false))
                    break
                case 'packfileContainer':
                    if (!entry.isFile)
                        throw new Error("Child found as Packfile Container and Directory. This shouldn't be possible.")
                    children.push(await PackfileContainerNode.fromHandle(entry, this, false))
                    break
                default:
                    const node = new FsNode()
                    node.name = entry.name
                    children.push(node)
            }



        }

        this.children = children
        this.populated = true
        return children
    }

    private static mapChildType(child: FileSystemHandle): FsNodeType {
        if (child.isDirectory) {
            return "directory"
        }

        if (child.name.match(/(vpp|str2)_(pc|ps4|xbox)$/)) {
            return "packfileContainer"
        }

        return "node"
    }
}