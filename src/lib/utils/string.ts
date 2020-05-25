export const readNullTerminatedString = (data: ArrayBuffer): string => {
    let buffer = ""
    let nullFound = false

    const array = new Uint8Array(data)

    array.forEach((val) => {
        if (val === 0) {
            nullFound = true
        }

        if (!nullFound) {
            buffer += String.fromCharCode(val)
        }
    })

    return buffer
}