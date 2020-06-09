import { FileSystemWritableStream } from './stream'

type FileSystemBaseHandle = {
    name: string,
    isSameEntry: (handle: FileSystemBaseHandle) => Promise<boolean>
}

export type FileSystemFileHandle = FileSystemBaseHandle & {
    name: string
    isFile: true
    isDirectory: false
    getFile: () => Promise<File>
    createWritable: () => Promise<FileSystemWritableStream>
}

export type FileSystemDirectoryHandle = FileSystemBaseHandle & {
    name: string
    isFile: false
    isDirectory: true
    entries: () => AsyncIterable<[string, FileSystemHandle]>
    getEntries: () => AsyncIterable<FileSystemHandle>
    getFile: (
        name: string,
        opts?: { create?: boolean }
    ) => Promise<FileSystemFileHandle>
    getDirectory: (
        name: string,
        opts?: { create?: boolean }
    ) => Promise<FileSystemDirectoryHandle>

    // Todo: Add valid return types
    removeEntry: (name: string, opts?: { recursive?: boolean }) => Promise<{}>
    resolve: (handle: FileSystemHandle) => Promise<{}>
}

export type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle
