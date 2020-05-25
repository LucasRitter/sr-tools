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
    nameOffset: number

    /**
     * Offset: 0x0010, Length: 0x0008, uint64
     * Offset of the data in the data section.
     */
    dataOffset: number

    /**
     * Offset: 0x0018, Length: 0x0008, uint64
     * Offset of the data in the data section.
     */
    uncompressedSize: number

    /**
     * Offset: 0x0020, Length: 0x0008, uint64
     * Offset of the data in the data section.
     */
    compressedSize: number

    private constructor() {

    }

    public static from(buffer: ArrayBuffer) {
        if (buffer.byteLength < PackfileDirectoryEntry.SIZE) {
            // Todo: Write proper error message
            throw new Error("")
        }

        const entry = new PackfileDirectoryEntry()
        const view = new DataView(buffer)

        entry.nameOffset = getUint64(view, Offsets.NameOffset, true)
        entry.dataOffset = getUint64(view, Offsets.DataOffset, true)
        entry.uncompressedSize = getUint64(view, Offsets.UncompressedSize, true)
        entry.compressedSize = getUint64(view, Offsets.CompressedSize, true)

        return entry
    }
}