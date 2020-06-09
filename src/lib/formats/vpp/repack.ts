import { FileSystemDirectoryHandle, FileSystemFileHandle } from '~/lib/nativefs/handle'
import { PackfileHeader, PackfileHeaderFlags } from '~/lib/formats/vpp/header'
import { PackfileDirectoryEntry } from '~/lib/formats/vpp/directoryentry'
import { Packfile } from '~/lib/formats/vpp/file'

// Todo: Change to functions that don't require explicit user interaction when accepting permissions.
export async function repackPackfile(source: FileSystemDirectoryHandle, target: FileSystemFileHandle, flags: PackfileHeaderFlags) {
    const header = new PackfileHeader()
    header.flags = flags

    const files: FileSystemFileHandle[] = []
    for await (let file of source.getEntries()) {
        if (await target.isSameEntry(file))
            continue
        if (!file.isFile)
            continue
        files.push(file)
    }

    const entries: PackfileDirectoryEntry[] = []
    let nameDataLength = 0
    files.forEach((file, index) => {
        entries.push(new PackfileDirectoryEntry())
        nameDataLength += file.name.length + 1
    })

    const nameDataArray = new Uint8Array(nameDataLength)
    let written = 0
    for (let i = 0; i < files.length; i++) {
        const file = files[i]

        entries[i].nameOffset = written

        for (let letterIndex = 0; letterIndex < file.name.length; letterIndex++) {
            nameDataArray[written] = file.name.charCodeAt(letterIndex)
            written++
        }
        if (written < nameDataArray.length) {
            nameDataArray[written] = 0
            written++
        }
    }

    const sectionOffsets = {
        header: 0,
        entries: 1,
        names: 0,
        data: 0
    }

    const entriesSizeInChunks = Math.ceil((files.length * PackfileDirectoryEntry.SIZE) / Packfile.CHUNK_SIZE)
    const nameSizeInChunks = Math.ceil(nameDataLength / Packfile.CHUNK_SIZE)

    sectionOffsets.names = 1 + entriesSizeInChunks
    sectionOffsets.data = sectionOffsets.names + nameSizeInChunks

    let writtenDataOffset = sectionOffsets.data * Packfile.CHUNK_SIZE

    const writer = await target.createWritable()

    for (let i = 0; i < files.length; i ++) {
        // Todo: Add support for compressed files
        const file = files[i]
        let data: ArrayBuffer = undefined
        let compressedData = undefined

        data = await (await file.getFile()).arrayBuffer()

        if (header.flags & PackfileHeaderFlags.Compressed) {
            throw new Error("Building compressed archives isn't available yet :(")
        }

        entries[i].dataOffset = writtenDataOffset - sectionOffsets.data * Packfile.CHUNK_SIZE
        entries[i].uncompressedSize = data.byteLength

        await writer.write({ type: 'write', data, position: writtenDataOffset})

        if (header.flags & PackfileHeaderFlags.Condensed) {
            writtenDataOffset += data.byteLength
        } else {
            if (i === files.length -1) {
                writtenDataOffset += data.byteLength
            }
            else {
                writtenDataOffset += Math.ceil(data.byteLength / Packfile.CHUNK_SIZE) * Packfile.CHUNK_SIZE
            }

        }
    }

    // Update header values
    header.directoryEntryCount = entries.length
    header.directorySize = entries.length * PackfileDirectoryEntry.SIZE
    header.uncompressedDataSize = writtenDataOffset
    header.nameSize = nameDataLength
    header.packfileSize = sectionOffsets.data * Packfile.CHUNK_SIZE + writtenDataOffset

    await writer.write({ type: 'write', position: 0, data: header.write()})

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        await writer.write({ type: 'write', position: Packfile.CHUNK_SIZE * sectionOffsets.entries + i * PackfileDirectoryEntry.SIZE, data: entry.write()})
    }

    await writer.write({ type: 'write', position: Packfile.CHUNK_SIZE * sectionOffsets.names, data: nameDataArray})

    await writer.close()

    alert("Done!")
}
