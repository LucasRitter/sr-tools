import { PackfileHeader, PackfileHeaderFlags } from './header'
import { PackfileDirectoryEntry } from './directoryentry'
import { readNullTerminatedString } from '~/lib/utils/string'
import { decompressBlock } from '~/lib/lz4/lz4'

// FIXME: Make file access independent of index

type BrowserFile = {
    source: 'browser-file'
    file: File
}
type ArrayFile = {
    source: 'uint8array'
    array: Uint8Array
}

type ChunkInfo = {
    offset: number
    size: number
}

type ChunkIndices = {
    directory: ChunkInfo
    names: ChunkInfo
    data: ChunkInfo
}

// Todo: Move all 64bit numbers to BigInt for increased precision.
export class Packfile {
    public static readonly CHUNK_SIZE = 0x1000

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
    private _dataOffsets: number[]
    private _namesData: ArrayBuffer

    public get header() {
        return this._header
    }
    public get directory() {
        // Todo: Deep-copy instead of returning references to originals.
        return this._directoryEntries
    }
    public get flags() {
        return {
            compressed: this._header.flags & PackfileHeaderFlags.Compressed,
            condensed: this._header.flags & PackfileHeaderFlags.Condensed,
        }
    }

    private calculateRealDataOffsets(): number[] {
        const offsets = []

        // Keeps track of the total data. Used for condensed offset calculation.
        let totalOffset = 0



        this._directoryEntries.forEach((val) => {
            if (this.flags.condensed) {
                offsets.push(totalOffset)
                totalOffset += this.flags.compressed
                    ? Number(val.compressedSize)
                    : val.uncompressedSize
            } else {
                offsets.push(totalOffset)
                totalOffset += Math.ceil((this.flags.compressed
                    ? Number(val.compressedSize)
                    : val.uncompressedSize) / Packfile.CHUNK_SIZE) * Packfile.CHUNK_SIZE
            }
        })

        if (offsets.length !== this._directoryEntries.length) {
            throw new Error(
                'Something went wrong during offset calculation of a packfile.'
            )
        }

        return offsets
    }

    public static async fromBrowserFile(file: File): Promise<Packfile> {
        const pack = new Packfile()

        pack._source = {
            source: 'browser-file',
            file,
        }

        await pack.initialize()

        return pack
    }

    public static async fromUint8Array(array: Uint8Array): Promise<Packfile> {
        const pack = new Packfile()

        pack._source = {
            source: 'uint8array',
            array
        }

        await pack.initialize()

        return pack
    }

    private async initialize() {
        this._header = PackfileHeader.from(
            await this.getRawData(0, Packfile.CHUNK_SIZE)
        )

        // Create basic chunk map
        const directoryChunk: ChunkInfo = {
            offset: 1,
            size: Math.ceil(this._header.directorySize / Packfile.CHUNK_SIZE),
        }
        const namesChunk: ChunkInfo = {
            offset: directoryChunk.offset + directoryChunk.size,
            size: Math.ceil(this._header.nameSize / Packfile.CHUNK_SIZE),
        }
        const dataChunk: ChunkInfo = {
            offset: namesChunk.offset + namesChunk.size,
            size: -1,
        }

        this._sections = {
            directory: directoryChunk,
            names: namesChunk,
            data: dataChunk,
        }

        // Size checking for directory
        if (
            this._header.directoryEntryCount * PackfileDirectoryEntry.SIZE !==
            this._header.directorySize
        ) {
            throw new Error("Packfile.directorySize doesn't match count.")
        }

        // Calculate real offset for directory section
        const directoryBeginOffset =
            this._sections.directory.offset * Packfile.CHUNK_SIZE

        // Fetch data from disk as array buffer
        const entryBuffer = await this.getRawData(
                directoryBeginOffset,
                directoryBeginOffset + this._header.directorySize
            )

        const entries: PackfileDirectoryEntry[] = []
        for (let i = 0; i < this._header.directoryEntryCount; i++) {
            const offset = i * PackfileDirectoryEntry.SIZE
            entries.push(
                PackfileDirectoryEntry.from(
                    entryBuffer.slice(
                        offset,
                        offset + PackfileDirectoryEntry.SIZE
                    )
                )
            )
        }

        this._directoryEntries = entries
        this._dataOffsets = this.calculateRealDataOffsets()

        // Size checking for directory
        if (
            this._header.directoryEntryCount * PackfileDirectoryEntry.SIZE !==
            this._header.directorySize
        ) {
            throw new Error("Packfile.directorySize doesn't match count.")
        }

        const namesDataBeginOffset =
            this._sections.names.offset * Packfile.CHUNK_SIZE
        this._namesData = await this.getRawData(
                namesDataBeginOffset,
                namesDataBeginOffset + this._header.nameSize
            )
    }

    private async getRawData(
        start: number,
        end?: number
    ): Promise<ArrayBuffer> {
        switch (this._source.source) {
            case 'browser-file':
                return await this._source.file.slice(start, end).arrayBuffer()
            case 'uint8array':
                return this._source.array.slice(start, end).buffer
        }


        throw new Error(
            // @ts-ignore
            `Packfiles from source '${this._source.source}' are not supported yet.`
        )
    }

    public getNameFromOffset(offset: number) {
        if (offset >= this._namesData.byteLength) {
            throw new Error('Target offset outside of name data range.')
        }

        return readNullTerminatedString(this._namesData.slice(offset))
    }

    async getDataFromIndex(index: number): Promise<ArrayBuffer> {
        const i = Math.abs(index)

        let offset = this._dataOffsets[i]
        let entry = this._directoryEntries[i]

        const baseDataOffset = this._sections.data.offset * Packfile.CHUNK_SIZE

        if (this.flags.compressed) {
            const compressed = await this.getRawData(
                baseDataOffset + offset,
                baseDataOffset + offset + Number(entry.compressedSize)
            )
            const uncompressed = new Uint8Array(entry.uncompressedSize)
            decompressBlock(
                new Uint8Array(compressed),
                uncompressed,
                0x10,
                Number(entry.compressedSize) - 0x10,
                0
            )
            return uncompressed.buffer
        }

        return await this.getRawData(
            baseDataOffset + offset,
            baseDataOffset + offset + entry.uncompressedSize
        )
    }
}
