import { FsNode } from '~/lib/fs/node'
import { FsNodeType } from '~/lib/fs/navigator'
import { PackfileContainerNode } from '~/lib/fs/packfile/containerNode'
import { getFileName, mapFileType, mapNodeType } from '~/ui/utils/fileUtils'
import { GenericFileNode } from '~/lib/fs/genericFileNode'

export class PackfileEntryNode extends FsNode {
    type: FsNodeType = "node"
    container: PackfileContainerNode

    // Todo: Change to offset later
    index: number

    populated: boolean = false
    hideFromPath: true

    static async fromContainerAtIndex(container: PackfileContainerNode, index: number, autoPopulate: boolean = false) {
        const packEntry = new PackfileEntryNode()

        if (container.packfile === undefined) {
            throw new Error("Packfile for container hasn't been parsed yet. Unable to create entry.")
        }

        if (container.packfile.directory.length <= index) {
            throw new Error("Tried to create a packfile entry node outside of range")
        }

        packEntry.container = container
        packEntry.index = index

        const nameOffset = container.packfile.directory[index].nameOffset
        packEntry.name = container.packfile.getNameFromOffset(nameOffset)

        if (autoPopulate) {
            await packEntry.populateChildren()
        }

        return packEntry
    }

    async populateChildren() {
        this.children = [ await this.getTypedNode() ]
        this.populated = true
    }

    async getData() {
        return await this.container.packfile.getDataFromIndex(this.index)
    }

    async getTypedNode() {
        const fileName = getFileName(this.name)

        const type = mapFileType(fileName.extension)
        switch (type) {
            case 'packfile':
            case 'str2':
                return PackfileContainerNode.fromBuffer(await this.getData(), this, this.name)
        }

        return GenericFileNode.fromBuffer(await this.getData(), this, this.name)
    }
}