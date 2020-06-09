import {
    FileSystemDirectoryHandle,
    FileSystemHandle,
} from '~/lib/nativefs/handle'
import { applyMiddleware } from 'redux'
import { createStore } from 'react-hooks-global-state'
import { verifyDirectory } from '~/lib/directory'
import { FsNodeNavigator } from '~/lib/fs/navigator'

type ReadyState = 'not-ready' | 'checking-dir' | 'ready'

type GeneralState = {
    readyState: ReadyState
    handle?: FileSystemDirectoryHandle
    navigator?: FsNodeNavigator
}

type Action =
    | {
          type: 'set-handle'
          handle: FileSystemDirectoryHandle
      }
    | {
          type: 'reset-handle'
      }
    | {
          type: 'set-navigator'
          nav: FsNodeNavigator
      }
    | {
          type: 'set-ready-state'
          ready: ReadyState
      }

const verifyHandle = async (handle: FileSystemDirectoryHandle) => {
    const success = await verifyDirectory(handle)
    const nav = await FsNodeNavigator.fromDirectoryHandle(handle)

    if (success && nav) {
        dispatchGeneral({ type: 'set-ready-state', ready: 'ready' })
        dispatchGeneral({ type: 'set-navigator', nav })
    } else {
        dispatchGeneral({ type: 'reset-handle' })
    }

    console.log('poof done')
}

const reducer = (state: GeneralState, action: Action) => {
    switch (action.type) {
        case 'set-handle':
            verifyHandle(action.handle)
            return {
                ...state,
                readyState: 'checking-dir',
                handle: action.handle,
            }
        case 'reset-handle':
            return { ...state, readyState: 'not-ready', handle: undefined }
        case 'set-ready-state':
            return { ...state, readyState: action.ready }
        case 'set-navigator':
            return { ...state, navigator: action.nav }
        default:
            console.warn("Bruh, you massive fucking doodoo brain forgot the path for the action:", action)
            return state
    }
}

const initialState: GeneralState = {
    readyState: 'not-ready',
    handle: undefined,
    navigator: undefined
}

export const {
    dispatch: dispatchGeneral,
    useGlobalState: useGeneralGlobalState,
} = createStore(reducer, initialState)
