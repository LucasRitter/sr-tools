export type FileSystemWritableStream = {
    write: (opts?: { type: "write", position?: number, data: any} | { type: "seek", position: number } | { type: "truncate", size: number} | ArrayBuffer | Uint8Array) => Promise<never>
    close: () => Promise<void>
}
