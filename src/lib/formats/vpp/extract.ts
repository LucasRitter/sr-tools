import { PackfileEntryNode } from '~/lib/fs/packfile/entryNode'
import { PackfileContainerNode } from '~/lib/fs/packfile/containerNode'

export async function extractPackfileNode(node: PackfileContainerNode): Promise<boolean> {
    alert("Please select a folder where the file will be extracted to. It'll create a new folder for the extracted files.")

    const target = await window.chooseFileSystemEntries({ type: 'open-directory' })

    if (!target.isDirectory) {
        alert("Unable to extract to a file :(")
        return false
    }

    const targetDir = await target.getDirectory(node.name, { create: true })

    for (let i = 0; i < node.packfile.directory.length; i++) {
        const childEntry = node.packfile.directory[i]
        const file = await targetDir.getFile(node.packfile.getNameFromOffset(childEntry.nameOffset), { create: true })
        const writable = await file.createWritable()
        const data = await node.packfile.getDataFromIndex(i);
        await writable.write({ type: 'write', data})
        await writable.close()
    }

    alert("Finished extracting!")

    return true
}