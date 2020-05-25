import {Packfile} from "./lib/formats/vpp/file";
import * as FileSaver from "file-saver";

const input = <HTMLInputElement>document.getElementById("fileInput")
let packfile: Packfile = undefined

function addElements(elem: HTMLElement) {
    const directory = packfile.directory
    elem.innerHTML = ""
    for (let i = 0; i < directory.length; i++) {
        const row = document.createElement("tr")

        const name = row.insertCell(0)
        name.innerText = packfile.getNameAtOffset(directory[i].nameOffset)

        const size = row.insertCell(1)
        size.innerText = ((directory[i].compressedSize === -1 ? directory[i].uncompressedSize : directory[i].compressedSize) / 1000).toFixed(1) + " KB"

        const download = row.insertCell(2)
        download.innerText = "Download"
        download.addEventListener("click", () => downloadFromIndex(i))

        elem.appendChild(row)
    }
}

async function downloadFromIndex(i) {
    const directory = packfile.directory[i]
    // Todo: Add support for compressed data
    const data = await packfile.fetchDataAt(directory.dataOffset, directory.uncompressedSize)
    const blob = new Blob([data])

    FileSaver.saveAs(blob, packfile.getNameAtOffset(directory.nameOffset))
}

async function handleFileChange() {
    if (!input.files) {
        return
    }

    packfile = await Packfile.fromBrowserFile(input.files[0])

    const elem = document.getElementById("fileTable")
    elem.innerHTML = "Loading"

    addElements(elem)
}

input.addEventListener('change', handleFileChange)