// Todo: Move all 64bit numbers to BigInt for increased precision.
import {getUint64} from "../../utils/dataview";
import {readNullTerminatedString} from "../../utils/string";

enum Offsets {
    Magic = 0x0000,
    Version = 0x0004,
    Name = 0x0008,
    Path = 0x0049,
    Flags = 0x014C,
    Unk = 0x0150,
    DirectoryEntryCount = 0x0158,
    PackfileSize = 0x0160,
    DirectorySize = 0x0168,
    NameSize = 0x0170,
    UncompresedDataSize = 0x0178,
    CompressedDataSize = 0x0180
}

export class PackfileHeader {
    public static readonly SIZE = 0x0188
    public static readonly NAME_LENGTH = 0x0041
    public static readonly PATH_LENGTH = 0x0100

    /**
     * Offset: 0x0000, Length: 0x0004, uint32
     * Magic of the VPP / Packfile format
     */
    magic: number = 1367935694

    /**
     * Offset: 0x0004, Length: 0x0004, uint32
     * Version number of VPP / Packfile format
     */
    version: number = 6

    // Thanks to Rick @ Gib.com for the following 4 values

    /**
     * Offset: 0x0008, Length: 0x0041, char[65]
     * Name of the archive, usually 0-ed out
     */
    name: string = ""

    /**
     * Offset: 0x0049, Length: 0x0100, char[256]
     * Path of the archive, usually 0-ed out
     */
    path: string = ""

    /**
     * Offset: 0x014C, Length: 0x0004, uint32
     * Flags
     */
    flags: PackfileHeaderFlags | number = 0

    /**
     * Offset: 0x0150, Length: 0x0008, uint64
     */
    unk0x150: number = 0

    /**
     * Offset: 0x0158, Length: 0x0008, uint64
     * The number of entries in the directory
     */
    directoryEntryCount: number = 0

    /**
     * Offset: 0x0160, Length: 0x0008, uint64
     * The size of the VPP / Packfile
     */
    packfileSize: number = 0

    /**
     * Offset: 0x0168, Length: 0x0008, uint64
     * The size of the directory section in bytes
     */
    directorySize: number = 0

    /**
     * Offset: 0x0170, Length: 0x0008, uint64
     * The size of the name section in bytes
     */
    nameSize: number

    /**
     * Offset: 0x0178, Length: 0x0008, uint64
     * The size of the uncompressed data section
     */
    uncompressedDataSize: number

    /**
     * Offset: 0x0180, Length: 0x0008, uint64
     * The size of the compressed data section
     */
    compressedDataSize: bigint = 18446744073709551615n

    constructor() {

    }

    public static from(array: ArrayBuffer) {
        if (array.byteLength < 0x0188) {
            throw new Error(`Header size must be at least 0x${PackfileHeader.SIZE} bytes long, got 0x${array.byteLength} instead.`)
        }

        const header = new PackfileHeader()
        const view = new DataView(array)

        header.magic = view.getUint32(Offsets.Magic, true)
        header.version = view.getUint32(Offsets.Version, true)
        header.name = readNullTerminatedString(array.slice(Offsets.Name, Offsets.Name + PackfileHeader.NAME_LENGTH))
        header.path = readNullTerminatedString(array.slice(Offsets.Path, Offsets.Path + PackfileHeader.PATH_LENGTH))
        header.flags = view.getUint32(Offsets.Flags, true)
        header.unk0x150 = Number(view.getBigUint64(Offsets.Unk, true))
        header.directoryEntryCount =  Number(view.getBigUint64(Offsets.DirectoryEntryCount, true))
        header.packfileSize =  Number(view.getBigUint64(Offsets.PackfileSize, true))
        header.directorySize =  Number(view.getBigUint64(Offsets.DirectorySize, true))
        header.nameSize =  Number(view.getBigUint64(Offsets.NameSize, true))
        header.uncompressedDataSize =  Number(view.getBigUint64(Offsets.UncompresedDataSize, true))
        header.compressedDataSize =  view.getBigUint64(Offsets.CompressedDataSize, true)

        return header
    }

    write(): ArrayBuffer {
        const buffer = new ArrayBuffer(PackfileHeader.SIZE)
        const view = new DataView(buffer)

        view.setUint32(Offsets.Magic, this.magic, true)
        view.setUint32(Offsets.Version, this.version, true)

        // Todo: Add null terminated string writing support

        view.setUint32(Offsets.Flags, this.flags, true)
        view.setBigUint64(Offsets.Unk, BigInt(this.unk0x150), true)
        view.setBigUint64(Offsets.DirectoryEntryCount, BigInt(this.directoryEntryCount), true)
        view.setBigUint64(Offsets.PackfileSize, BigInt(this.packfileSize), true)
        view.setBigUint64(Offsets.DirectorySize, BigInt(this.directorySize), true)
        view.setBigUint64(Offsets.NameSize, BigInt(this.nameSize), true)
        view.setBigUint64(Offsets.UncompresedDataSize, BigInt(this.uncompressedDataSize), true)
        view.setBigUint64(Offsets.CompressedDataSize,this.compressedDataSize, true)

        return buffer
    }
}

export enum PackfileHeaderFlags {
    Compressed = 1 << 0,
    Condensed = 1 << 1
}

