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
    magic: number

    /**
     * Offset: 0x0004, Length: 0x0004, uint32
     * Version number of VPP / Packfile format
     */
    version: number

    // Thanks to Rick @ Gib.com for the following 4 values

    /**
     * Offset: 0x0008, Length: 0x0041, char[65]
     * Name of the archive, usually 0-ed out
     */
    name: string

    /**
     * Offset: 0x0049, Length: 0x0100, char[256]
     * Path of the archive, usually 0-ed out
     */
    path: string

    /**
     * Offset: 0x014C, Length: 0x0004, uint32
     * Flags
     */
    flags: PackfileHeaderFlags | number

    /**
     * Offset: 0x0150, Length: 0x0008, uint64
     */
    unk0x150: number

    /**
     * Offset: 0x0158, Length: 0x0008, uint64
     * The number of entries in the directory
     */
    directoryEntryCount: number

    /**
     * Offset: 0x0160, Length: 0x0008, uint64
     * The size of the VPP / Packfile
     */
    packfileSize: number

    /**
     * Offset: 0x0168, Length: 0x0008, uint64
     * The size of the directory section in bytes
     */
    directorySize: number

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
    compressedDataSize: number

    private constructor() {

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
        header.unk0x150 = getUint64(view, Offsets.Unk, true)
        header.directoryEntryCount = getUint64(view, Offsets.DirectoryEntryCount, true)
        header.packfileSize = getUint64(view, Offsets.PackfileSize, true)
        header.directorySize = getUint64(view,Offsets.DirectorySize, true)
        header.nameSize = getUint64(view, Offsets.NameSize, true)
        header.uncompressedDataSize = getUint64(view, Offsets.UncompresedDataSize, true)
        header.compressedDataSize = getUint64(view, Offsets.CompressedDataSize, true)

        return header
    }
}

export enum PackfileHeaderFlags {
    Compressed = 1 << 0,
    Condensed = 1 << 1
}