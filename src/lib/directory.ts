import { FileSystemDirectoryHandle } from './nativefs/handle'

export async function verifyDirectory(
    handle: FileSystemDirectoryHandle
): Promise<boolean> {
    if (!handle.isDirectory) {
        throw new Error('Handle does not represent a directory')
    }

    let executableFound = false
    let cacheFound = false
    let videosFound = false

    for await (let file of handle.getEntries()) {
        switch (file.name.toLowerCase()) {
            case "srttr.exe":
                if (file.isFile)
                    executableFound = true
                break
            case "cache":
                if (file.isDirectory)
                    cacheFound = true
                break
            case "videos":
                if (file.isDirectory)
                    videosFound = true
                break
        }
    }

    return executableFound && cacheFound && videosFound
}
