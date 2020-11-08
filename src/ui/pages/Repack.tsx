import * as React from 'react'
import { useGeneralGlobalState } from '~/ui/state/general'
import { useHistory } from 'react-router'
import { useNavigatorGlobalState } from '~/ui/state/navigation'
import { Header } from '../components/Header'
import { Button } from '~/ui/components/input/Button'
import { repackPackfile } from '~/lib/formats/vpp/repack'

const repack = async () => {
    alert("Select folder to repack")
    const source = await window.showDirectoryPicker()
    const target = await window.showSaveFilePicker()

    if (!source.isDirectory || !target.isFile) {
        return
    }

    await repackPackfile(source, target, 0)
}

interface Props {}

export function RepackPage(props: Props) {
    const [root] = useNavigatorGlobalState('root')
    const history = useHistory()

    if (!root) {
        history.push('/')
        return null
    }

    return <>
        <Header>Repack (Use at your own risk!)</Header>
        <Button type={'danger'} onClick={() => repack()}>Start Process</Button>
    </>
}
