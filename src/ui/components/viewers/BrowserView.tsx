import * as React from 'react'
import { FsNodeNavigator } from '~/lib/fs/navigator'
import { FsNode } from '~/lib/fs/node'
import { useNavigatorGlobalState } from '~/ui/state/navigation'
import { BrowserCard } from '~/ui/components/BrowserCard'
import { getFileName, groupNodes, mapNodeType } from '~/ui/utils/fileUtils'
import { DirectoryNode } from '~/lib/fs/directoryNode'
import { colors } from '~/ui/colors'
import { IconCube } from '~/ui/components/icons/Cube'
import { motion } from 'framer-motion'

interface Props {
    onNodeClick?: (node: FsNode) => void
    hidden?: boolean
}

const variants = {
    visible: i => ({
        opacity: 1,
        transition: {
            delay: i * 0.001,
        },
        y: 0
    }),
    hidden: { opacity: 0, y: 4 },
}

export function BrowserView({onNodeClick, hidden}: Props) {
    const [path] = useNavigatorGlobalState('path')
    const [current] = useNavigatorGlobalState('current')
    const [children] = useNavigatorGlobalState('children')

    if (hidden) {
        return null;
    }

    const grouped = groupNodes(children)

    return (
        <div
            style={{
                display: "grid",
                width: "1fr",
                height: "100vh",
                
                flex: "1 1 auto",

                gridAutoFlow: "row",
                gridTemplateColumns: "1fr",

                gap: 24,

                paddingRight: 12
            }}
        >
            {
                grouped.map((v) => {
                    if (!v.nodes || v.nodes.length === 0)
                        return null

                    const format = mapNodeType[v.type] || { title: "Undefined", formatName: undefined }

                    return (
                        <BrowserViewSection title={format.title} >
                            { v.nodes.sort((a, b) => a.name.localeCompare(b.name)).map((n) => (
                                <BrowserCard onClick={() => onNodeClick(n)} title={getFileName(n.name).name} subtitle={format.formatName || getFileName(n.name).extension + " file"} icon={IconCube}/>
                            ))}
                        </BrowserViewSection>
                    )

                })
            }
        </div>
    )
}

function BrowserViewSection({title, children}: { title: string, children: JSX.Element[]}) {

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                marginBottom: 12
            }}
        >
            <div style={{
                fontSize: 14,
                letterSpacing: -0.5,
                lineHeight: 1.2,
                fontWeight: 600,
                marginBottom: 16
            }}>{title}</div>
            <div style={{
                display: "grid",
                width: "100%",
                height: "100%",

                gridAutoFlow: "row dense",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gridTemplateRows: "repeat(auto-fill, 160px)",

                gap: 24,

                paddingRight: 12
            }}>
                { children.length <= 128 ? children.map((item, i) => (
                    <motion.div initial={"hidden"} custom={i} animate={"visible"} variants={variants} key={i}>{item}</motion.div>
                )) : children}
            </div>
        </div>
    )
}