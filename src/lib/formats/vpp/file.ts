import {PackfileHeader, PackfileHeaderFlags} from "./header";
import {PackfileDirectoryEntry} from "./directoryentry";
import {readNullTerminatedString} from "../../utils/string";

type BrowserFile = {
    source: "browser-file",
    file: File
}
type ArrayFile = {
    source: "uint8array",
    array: Uint8Array
}

type ChunkInfo = {
    offset: number
    size: number
}

type ChunkIndices = {
    directory: ChunkInfo,
    names: ChunkInfo,
    data: ChunkInfo
}

// Todo: Move all 64bit numbers to BigInt for increased precision.
export class Packfile {
    public static readonly CHUNK_SIZE = 0x1000;

    /**
     * The source of the Packfile.
     */
    private _source: BrowserFile | ArrayFile

    /**
     * Data in Packfile6 x64 files are put in chunks of 0x1000 bytes.
     * A new section can never start at an odd offset, always at the start of a new chunk.
     */
    private _sections: ChunkIndices

    private _header: PackfileHeader
    private _directoryEntries: PackfileDirectoryEntry[]
    private _compressedEntryOffsets: number[]
    private _namesData: ArrayBuffer

    public get header() {
        return this._header
    }
    public get directory() {
        // Todo: Deep-copy instead of returning references to originals.
        return this._directoryEntries
    }

    /**
     *
     * @param file
     */
    public static async fromBrowserFile(file: File): Promise<Packfile> {
        const vpp = new Packfile()

        vpp._source = {
            source: "browser-file",
            file: file
        }

        // Parse the header
        vpp._header = PackfileHeader.from(await file.slice(0x0, Packfile.CHUNK_SIZE).arrayBuffer())

        // Create basic chunk map
        const directoryChunk: ChunkInfo = {
            offset: 1,
            size: Math.ceil(vpp._header.directorySize / Packfile.CHUNK_SIZE)
        }
        const namesChunk: ChunkInfo = {
            offset: directoryChunk.offset + directoryChunk.size,
            size: Math.ceil(vpp._header.nameSize / Packfile.CHUNK_SIZE)
        }
        const dataChunk: ChunkInfo = {
            offset: namesChunk.offset + namesChunk.size,
            size: -1
        }
        vpp._sections = {
            directory: directoryChunk,
            names: namesChunk,
            data: dataChunk
        }

        // Size check for directory
        if (vpp._header.directoryEntryCount * PackfileDirectoryEntry.SIZE !== vpp._header.directorySize) {
            throw new Error("Packfile.directorySize doesn't match count.")
        }
        // Calculate real offset for directory section
        const directoryBeginOffset = vpp._sections.directory.offset * Packfile.CHUNK_SIZE

        // Fetch data from disk as array buffer
        const entryBuffer = await file.slice(directoryBeginOffset, directoryBeginOffset + vpp._header.directorySize).arrayBuffer()

        const isCompressed = vpp._header.flags & PackfileHeaderFlags.Compressed || vpp._header.flags & PackfileHeaderFlags.Condensed

        //
        const entries: PackfileDirectoryEntry[] = []
        const compressedEntryOffsets: number[] = []
        let chunk: number = 0
        for (let i = 0; i < vpp._header.directoryEntryCount; i++) {
            const offset = i * PackfileDirectoryEntry.SIZE
            const entry = PackfileDirectoryEntry.from(entryBuffer.slice(offset, offset + PackfileDirectoryEntry.SIZE))
            entries.push(entry)

            if (isCompressed) {
                compressedEntryOffsets.push(chunk)
                chunk += Math.ceil(entry.compressedSize / Packfile.CHUNK_SIZE)
            }
            // Increase chunk number for next
        }
        vpp._directoryEntries = entries
        vpp._compressedEntryOffsets = compressedEntryOffsets

        // Todo: Ensure proper minimum size
        const namesDataBeginOffset = vpp._sections.names.offset * Packfile.CHUNK_SIZE
        vpp._namesData = await file.slice(namesDataBeginOffset, namesDataBeginOffset + vpp._header.nameSize).arrayBuffer()

        return vpp
    }

    debugLogAllFiles() {
        const data: {name: string, offset: number, size: number, compressed: boolean }[] = []

        for (let i = 0; i < this._directoryEntries.length; i++) {
            const entry = this._directoryEntries[i]
            data.push({
                name: this.getNameAtOffset(entry.nameOffset),
                offset: entry.dataOffset,
                size: entry.compressedSize !== -1 ? entry.compressedSize : entry.uncompressedSize,
                compressed: entry.compressedSize !== -1
            })
        }

        console.table(data)
    }

    getNameAtOffset(offset: number) {
        if (offset >= this._namesData.byteLength) {
            throw new Error("Target offset outside of name data range.")
        }

        return readNullTerminatedString(this._namesData.slice(offset))
    }

    fetchFromIndex(index: number) {
        if (Math.abs(index) >= this._directoryEntries.length) {
            throw new Error("Index outside of dictionary.")
        }

        return { ...this._directoryEntries[index] }
    }

    async fetchDataFromIndex(index: number): Promise<ArrayBuffer> {
        const entry = this._directoryEntries[index]

        let offset = 0
        let size = 0

        if (this._compressedEntryOffsets.length !== 0) {
            offset = (this._sections.data.offset + this._compressedEntryOffsets[index]) * Packfile.CHUNK_SIZE
            size = entry.compressedSize
        } else {
            offset = this._sections.data.offset * Packfile.CHUNK_SIZE
            size = entry.uncompressedSize
        }

        switch (this._source.source) {
            case "browser-file": {
                if (this._compressedEntryOffsets.length !== 0) {
                    const file = await this._source.file.slice(offset, offset + size).arrayBuffer()
                    // Todo: Find decompression method
                    return file
                }
                return this._source.file.slice(offset, size).arrayBuffer()
            }
            // Todo: Add download feature to other sources
        }
    }


}