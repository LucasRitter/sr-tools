import * as React from 'react'
import { useGeneralGlobalState } from '../state/general'
import { useHistory } from 'react-router'
import { Button } from '~/ui/components/input/Button'
import { FsNode } from '~/lib/fs/node'
import { DirectoryNode } from '~/lib/fs/directoryNode'
import { useNavigatorGlobalState, dispatchNavigator } from '../state/navigation'
import { BrowserView } from '~/ui/components/viewers/BrowserView'
import { PackfileEntryNode } from '~/lib/fs/packfile/entryNode'
import { FileViewer } from '~/ui/components/viewers/FileViewer'
import { Header } from '~/ui/components/Header'
import { ChevronRightIcon } from '~/ui/components/icons/ChevronRight'
import { motion } from 'framer-motion'
import { PackfileContainerNode } from '~/lib/fs/packfile/containerNode'
import { extractPackfileNode } from '~/lib/formats/vpp/extract'

interface Props {}

export function ViewerPage(props: Props) {
    const [root] = useNavigatorGlobalState('root')
    const history = useHistory()

    if (!root) {
        history.push('/')
        return null
    }

    const [path] = useNavigatorGlobalState('path')
    const [current] = useNavigatorGlobalState('current')
    const [children] = useNavigatorGlobalState('children')

    const historyListener = (location, action) => {
        if (action === 'POP') {
            if (path.length != 0) {
                history.push(history.location.pathname)
                dispatchNavigator({ type: 'go-up', by: 1 })
            } else {
                history.goBack()
            }
        }
    }

    React.useEffect(() => {
        history.push(history.location.pathname)
        const stopListening = history.listen(historyListener)

        return () => {
            stopListening()
        }
    }, [path])

    const handleNodeClick = async (node: FsNode) => {
        if (node instanceof PackfileEntryNode) {
            dispatchNavigator({ type: 'enter-child', child: await node })
        } else {
            dispatchNavigator({ type: 'enter-child', child: node })
        }
    }

    return (
        <div>
            <div style={{}}>
                <ViewerTitle
                    path={path}
                    onClick={(number) => {
                        dispatchNavigator({
                            type: 'go-up',
                            by: path.length - (number + 1),
                        })
                    }}
                    // Todo: Move this logic to a separate function
                    buttons={
                        current instanceof PackfileContainerNode ? [
                            {
                                text: 'Extract',
                                onClick: () => {
                                    extractPackfileNode(current).then(r => console.log("done"))
                                },
                            },
                        ] : []
                    }
                />
            </div>

            {current.type !== 'file' ? (
                // Todo: Make directories also show "extensions".
                <BrowserView onNodeClick={handleNodeClick} />
            ) : (
                <FileViewer
                    node={current}
                />
            )}
        </div>
    )
}

function ViewerTitle({
    path,
    onClick,
    buttons
}: {
    path: FsNode[]
    onClick?: (item: number) => void
    buttons?: { text: string; onClick: () => void }[]
}) {
    console.log(path)
    const filtered = path.filter((item) => !item.hideFromPath)

    const textStyle: React.CSSProperties = {
        marginRight: 8,
        fontSize: 14,
        letterSpacing: -0.5,
        lineHeight: 1.2,
        fontWeight: 600,
    }

    const chevronRight = (
        <div style={{ ...textStyle, opacity: 0.5, width: 20, height: 20 }}>
            <ChevronRightIcon />
        </div>
    )

    return (
        <div
            style={{
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
            }}
        >
            <div>
                <Header>File Browser</Header>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 24,
                    }}
                >
                    <motion.div
                        style={{ ...textStyle, opacity: 0.75 }}
                        whileHover={{ opacity: 1 }}
                        onClick={() => onClick(-1)}
                    >
                        Root
                    </motion.div>
                    {filtered.length > 0 && chevronRight}
                    {filtered.map((value, index) => {
                        if (index != filtered.length - 1)
                            return (
                                <>
                                    <motion.div
                                        onClick={() => {
                                            onClick?.(index)
                                        }}
                                        style={{ opacity: 0.75 }}
                                        whileHover={{ opacity: 1 }}
                                    >
                                        {value.name}
                                    </motion.div>
                                    {chevronRight}
                                </>
                            )

                        return <div>{value.name}</div>
                    })}
                </div>
            </div>
            <div>
                {buttons.map(b => (
                    <Button type={'default'} onClick={b.onClick}>{b.text}</Button>
                ))}
            </div>
        </div>
    )
}
