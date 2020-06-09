import { FsNode } from '~/lib/fs/node'
import { createStore } from 'react-hooks-global-state'
import { DirectoryNode } from '~/lib/fs/directoryNode'
import { act } from 'react-dom/test-utils'
import { PackfileContainerNode } from '~/lib/fs/packfile/containerNode'
import { PackfileEntryNode } from '~/lib/fs/packfile/entryNode'

type NavigatorState = {
    root?: FsNode
    path: FsNode[]
    current?: FsNode
    children?: FsNode[]
}

type Action =
    | {
          type: 'set-root'
          root: FsNode
      }
    | {
          type: 'enter-child'
          child: FsNode,
          forced?: boolean
      }
    | {
          type: 'enter-child-by-index'
          index: number
      }
    | {
          type: 'enter-child-by-name'
          name: string
      }
    | {
          type: 'go-up'
          by: number
      }
    | {
          type: 'update-current'
          current: FsNode
      }
      | {
    type: 'set-children',
    children: FsNode[]
}

const reducer = (state: NavigatorState, action: Action) => {
    switch (action.type) {
        case 'set-root':
            if (action.root instanceof DirectoryNode) {
                action.root.populateChildren().then((children) => {
                    dispatchNavigator({type: 'set-children', children: children})
                })
            }
            return {
                ...state,
                root: action.root,
                path: [],
                current: action.root,
                children: action.root.children
            }
        case 'enter-child':
            if (!state.current.children.includes(action.child) && !action.forced) {
                return state
            }

            if (action.child instanceof DirectoryNode || action.child instanceof PackfileContainerNode) {
                action.child.populateChildren().then((children) => {
                    dispatchNavigator({type: 'set-children', children: children})
                })
            }
            else if (action.child instanceof PackfileEntryNode) {
                const checkAndEnter = () => {
                    const realChild = action.child.children[0]
                    if (!realChild) {
                        alert("Unsupported file format :(")
                        throw new Error("Unsupported file format.")
                        return state
                    }

                    dispatchNavigator({ type: 'enter-child', child: realChild, forced: true})
                }

                if (!action.child.populated) {
                    action.child.populateChildren().then(() => {
                        checkAndEnter()
                    })
                } else {
                    checkAndEnter()
                }

                return state
            }

            return {
                ...state,
                current: action.child,
                path: [...state.path, action.child],
                children: action.child.children.length !== 0 ? action.child.children : state.children
            }

        case 'go-up': {
            let count = Math.min(action.by, state.path.length)
            let newPath = state.path.slice(0, state.path.length - count)
            let current = newPath.length === 0
                ? state.root
                : newPath[newPath.length - 1]

            return {
                ...state,
                path: newPath,
                current,
                children: current.children
            }
        }

        case 'set-children': {
            return {
                ...state,
                children: action.children
            }
        }

        default:
            return state
    }
}

const initialState: NavigatorState = {
    root: undefined,
    path: [],
    current: undefined,
    children: []
}

export const {
    dispatch: dispatchNavigator,
    useGlobalState: useNavigatorGlobalState,
} = createStore(reducer, initialState)
