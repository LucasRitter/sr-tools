import { FsNodeType } from '~/lib/fs/navigator'
import { FsNode } from '~/lib/fs/node'
import { FileSystemFileHandle } from '~/lib/nativefs/handle'
import { Packfile } from '~/lib/formats/vpp/file'
import { PackfileEntryNode } from '~/lib/fs/packfile/entryNode'

export class PackfileContainerNode extends FsNode {
    type: FsNodeType = "packfileContainer"

    source: {
        type: "file",
        file: FileSystemFileHandle
    } | {
        type: "buffer",
        buffer: ArrayBuffer
    }

    populated: boolean = false
    packfile: Packfile = undefined

    static async fromHandle(handle: FileSystemFileHandle, parent: FsNode, autoPopulate: boolean = false): Promise<PackfileContainerNode> {
        const node = new PackfileContainerNode()
        node.name = handle.name
        node.source = {
            type: 'file',
            file: handle
        }
        node.parent = parent

        if (autoPopulate)
            await node.populateChildren()

        return node
    }

    static async fromBuffer(buffer: ArrayBuffer, parent: FsNode, name: string, autoPopulate: boolean = false): Promise<PackfileContainerNode> {
        const node = new PackfileContainerNode()
        node.name = name
        node.source = {
            type: 'buffer',
            buffer
        }
        node.parent = parent

        if (autoPopulate)
            await node.populateChildren()

        return node
    }

    async populateChildren() {
        switch (this.source.type) {
            case 'file':
                this.packfile = await Packfile.fromBrowserFile(await this.source.file.getFile())
                break
            case 'buffer':
                this.packfile = await Packfile.fromUint8Array(new Uint8Array(this.source.buffer))
                break
        }

        const children = []

        for (let i = 0; i < this.packfile.directory.length; i ++) {
            children.push(await PackfileEntryNode.fromContainerAtIndex(this, i))
        }

        this.children = children;
        this.populated = true;

        return children
    }
}