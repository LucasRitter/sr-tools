import * as React from 'react'
import { Header } from '../components/Header'
import { Button } from '../components/input/Button'
import { dispatchGeneral } from '../state/general'
import { dispatchNavigator } from '../state/navigation'
import { DirectoryNode } from '~/lib/fs/directoryNode'

interface Props {}

export function HomePage(props: Props) {
    return (
        <div>
            <Header>Home</Header>
            <Button
                type="default"
                onClick={async () => {
                    const handle = await window.chooseFileSystemEntries({
                        type: 'open-directory',
                    })
                    if (!handle.isDirectory) {
                        alert(
                            'Selected file is not a directory. Please try again.'
                        )
                        return
                    }
                    dispatchNavigator({type: 'set-root', root: await DirectoryNode.from(handle, undefined, true)})
                }}
            >
                Open Folder
            </Button>
        </div>
    )
}
