export const hasNativeFs = () => {
    return window.showDirectoryPicker && window.showOpenFilePicker && window.showSaveFilePicker
}
