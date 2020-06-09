// Todo: Add generic Fs file node.

import { FsNode } from '~/lib/fs/node'
import { FileSystemFileHandle } from '~/lib/nativefs/handle'
import { FsNodeType } from '~/lib/fs/navigator'

export class GenericFileNode extends FsNode {
    source: {
        type: "file",
        file: FileSystemFileHandle
    } | {
        type: "buffer",
        buffer: ArrayBuffer
    } = undefined

    type: FsNodeType = "file"

    static fromBuffer(buffer: ArrayBuffer, parent: FsNode, name: string) {
        const node = new GenericFileNode()
        node.name = name
        node.source = {
            type: 'buffer',
            buffer
        }

        return node
    }

    async getSize() {
        switch (this.source.type) {
            case 'file':
                return (await this.source.file.getFile()).size
            case 'buffer':
                return this.source.buffer.byteLength
        }
    }

    async getData(start: number, end?: number) {
        switch (this.source.type) {
            case 'file':
                return await (await this.source.file.getFile()).slice(start, end).arrayBuffer()
            case 'buffer':
                return this.source.buffer.slice(start, end)
        }

        return undefined
    }

}