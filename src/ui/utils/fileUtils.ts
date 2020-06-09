import { FsNode } from '~/lib/fs/node'

export const getFileName = (
    filename: string
): {
    name: string
    extension: string
} => {
    const matched = filename.match(/([^.]+)(\.[^.]+$)?/)

    return {
        name: matched[1] || filename,
        extension: matched[2] || ""
    }
}

type NodeFileTypes = "directory" | "str2" | "packfile" | "file" | "executable" | "library" | "xtable" | "xml" | "lua-script" | "asm" | "strings"

export const mapFileType = (type: string): NodeFileTypes => {
    switch (type) {
        case ".str2_pc":
        case ".str2_xbox":
        case ".str2_ps4":
            return "str2"

        case ".vpp_pc":
        case ".vpp_xbox":
        case ".vpp_ps4":
            return "packfile"

        case ".asm_pc":
        case ".asm_xbox":
        case ".asm_ps4":
            return "asm"

        case ".le_strings":
            return "strings"

        case ".exe":
            return "executable"

        case ".dll":
            return "library"

        case ".xtbl":
            return "xtable"

        case ".xml":
            return "xml"

        case ".lua":
            return "lua-script"

        default: return "file"
    }
}

type NodeTypeMap = { [t in NodeFileTypes]: { title: string, formatName: string } }

export const mapNodeType: NodeTypeMap = {
    "directory": {
        title: "Directories",
        formatName: "directory"
    },
    "str2": {
        title: "Stream Archives",
        formatName: ".str2 archive"
    },
    "asm": {
        title: "Assembly",
        formatName: ".asm assembly"
    },
    "packfile": {
        title: "Packfiles",
        formatName: ".vpp packfile"
    },
    "file": {
        title: "Miscellaneous Files",
        formatName: undefined
    },
    "executable": {
        title: "Executables",
        formatName: ".exe executable"
    },
    "library": {
        title: "Libraries",
        formatName: ".dll library"
    },
    "xtable": {
        title: "Tables",
        formatName: ".xtbl table"
    },
    "xml": {
        title: "XML Documents",
        formatName: ".xml document"
    },
    "strings": {
        title: "Strings",
        formatName: ".le_strings dictionary"
    },
    "lua-script": {
        title: "Lua Scripts",
        formatName: ".lua script"
    },
}

type NodeGroup = { type: NodeFileTypes | "directory", nodes: FsNode[] }

export const groupNodes = (nodes: FsNode[]) => {
    const copied = [...nodes]
    const groups: NodeGroup[] = [
        { type: 'directory', nodes: [] },
        { type: 'packfile', nodes: [] },
        { type: 'str2', nodes: [] },
        { type: 'asm', nodes: [] },
        { type: 'xtable', nodes: [] },
        { type: 'xml', nodes: [] },
        { type: 'lua-script', nodes: [] },
        { type: 'strings', nodes: [] },
        { type: 'executable', nodes: [] },
        { type: 'library', nodes: [] },
        // Todo: Add missing file types
        { type: 'file', nodes: [] }
    ]

    for (let node of copied) {
        if (node.type === "directory") {
            groups.find(v => v.type === "directory").nodes.push(node)
            continue
        }

        const name = getFileName(node.name)
        const type = mapFileType(name.extension)

        const group = groups.find(v => v.type === type)
        if (group)
            group.nodes.push(node)
        else
            groups.find(v => v.type === "file").nodes.push(node)
    }

    return groups



}
