import {getUint64} from "../../utils/dataview";

enum Offsets {
    NameOffset = 0x00,
    DataOffset = 0x10,
    UncompressedSize = 0x18,
    CompressedSize = 0x20
}

// Todo: Move all 64bit numbers to BigInt for increased precision.
/**
 * Length: 0x0030
 */
export class PackfileDirectoryEntry {
    public static readonly SIZE = 0x30
    /**
     * Offset: 0x0000, Length: 0x0008, uint64
     * Offset of the name in the name data section.
     */
    nameOffset: number = 0

    /**
     * Offset: 0x0010, Length: 0x0008, uint64
     * Offset of the data in the data section.
     */
    dataOffset: number = 0

    /**
     * Offset: 0x0018, Length: 0x0008, uint64
     * Uncompressed size.
     */
    uncompressedSize: number = 0

    /**
     * Offset: 0x0020, Length: 0x0008, uint64
     * Compressed size. -1 / 0xFFFFFFFFFFFFFFFF if uncompressed.
     */
    compressedSize: bigint = 18446744073709551615n

    constructor() {

    }

    public static from(buffer: ArrayBuffer) {
        if (buffer.byteLength < PackfileDirectoryEntry.SIZE) {
            // Todo: Write proper error message
            throw new Error("")
        }

        const entry = new PackfileDirectoryEntry()
        const view = new DataView(buffer)

        entry.nameOffset = Number(view.getBigUint64(Offsets.NameOffset, true))
        entry.dataOffset = Number(view.getBigUint64(Offsets.DataOffset, true))
        entry.uncompressedSize = Number(view.getBigUint64(Offsets.UncompressedSize, true))
        entry.compressedSize = view.getBigUint64(Offsets.CompressedSize, true)

        return entry
    }

    public write(): ArrayBuffer {
        const buffer = new ArrayBuffer(PackfileDirectoryEntry.SIZE)
        const view = new DataView(buffer)

        // Todo:
        view.setBigUint64(Offsets.NameOffset, BigInt(this.nameOffset), true)
        view.setBigUint64(Offsets.DataOffset, BigInt(this.dataOffset), true)
        view.setBigUint64(Offsets.UncompressedSize, BigInt(this.uncompressedSize), true)
        view.setBigUint64(Offsets.CompressedSize, this.compressedSize, true)

        return buffer
    }
}