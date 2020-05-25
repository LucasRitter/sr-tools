const MAX_32BIT_INT = 2 ** 32

const isSafeInteger = (number: number) => (
    Math.abs(number) <= 9007199254740991
)

/**
 * Reads a 64-bit number at a given offset from a DataView instance.
 * Special thanks to u/AnthumChris for his StackOverflow answer:
 *   https://stackoverflow.com/a/53107482
 * @param view The DataView instance from which to read the number from
 * @param offset The offset from where to read the data.
 * @param littleEndian Specify data to be formatted as little endian.
 */
export const getUint64 = (view: DataView, offset: number, littleEndian?: boolean) => {
    // Split 64-bit number into two 32-bit parts
    const left = view.getUint32(offset, littleEndian)
    const right = view.getUint32(offset + 4, littleEndian)

    // Combine the two 32-bit values
    const combined = littleEndian
        ? left + MAX_32BIT_INT * right
        : MAX_32BIT_INT * left + right

    // Check if it's a safe integer
    if (!isSafeInteger(combined)) {
        if (left === right && left === 2 ** 32 - 1) {
            console.warn("MAX_INT_64 found. Returning -1.")
            return -1
        }
        console.warn("Number above max safe integer limit (2^53-1) found. Precision might be lost.")
    }

    return combined
}