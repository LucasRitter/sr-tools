import { createStore } from 'react-hooks-global-state'
import { colors } from '~/ui/colors'
import useLocalStorage from '~/ui/utils/useLocalStorage'
import { applyMiddleware } from 'redux'
import { Dispatch } from 'react'

// Fixme: Use styled-theming

const localStorageKey = 'theme'
const defaultAccent = colors.purple

type ThemeState = {
    accent: string
    dark: boolean
}

type Action =
    | {
          type: 'set-accent'
          accent: string
      }
    | {
          type: 'reset-accent'
      }
    | {
          type: 'toggle-dark-mode'
      }
    | {
          type: 'set-dark-mode'
          value: boolean
      }

const reducer = (state: ThemeState, action: Action) => {
    switch (action.type) {
        case 'set-accent':
            return { ...state, accent: action.accent }
        case 'reset-accent':
            return { ...state, accent: defaultAccent }
        case 'toggle-dark-mode':
            return { ...state, dark: !state.dark }
        case 'set-dark-mode':
            return { ...state, dark: action.value }
        default:
            return state
    }
}

const initialState: ThemeState = {
    accent: defaultAccent,
    dark: false,
    ...JSON.parse(localStorage.getItem(localStorageKey)),
}

const saveStateToStorage = (
    { getState }: { getState: () => ThemeState },
) => (next: Dispatch<Action>) => (action: Action) => {
    const returnValue = next(action);
    localStorage.setItem(localStorageKey, JSON.stringify(getState()));
    return returnValue;
};


export const {
    dispatch: dispatchTheme,
    useGlobalState: useGlobalThemeState,
} = createStore(reducer, initialState, applyMiddleware(saveStateToStorage))
