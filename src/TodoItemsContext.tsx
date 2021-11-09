import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import produce from 'immer'

export interface TodoItem {
  id: string
  title: string
  details?: string
  done: boolean
}

interface TodoItemsState {
  todoItems: TodoItem[]
}

interface TodoItemsAddAction {
  type: 'add'
  data: {
    todoItem: {
      title: string
      details: string
    }
  }
}

interface TodoItemsLoadStateAction {
  type: 'loadState'
  data: {
    todoItems: TodoItem[]
  }
}

interface TodoItemsDeleteAction {
  type: 'delete'
  data: {
    id: string
  }
}

interface TodoItemsToggleDoneAction {
  type: 'toggleDone'
  data: {
    id: string
  }
}

interface TodoItemsEditAction {
  type: 'edit'
  data: {
    todoItem: {
      id: string
      title: string
      details: string
    }
  }
}

type TodoItemsAction =
  | TodoItemsAddAction
  | TodoItemsLoadStateAction
  | TodoItemsDeleteAction
  | TodoItemsToggleDoneAction
  | TodoItemsEditAction

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null)

const defaultState = { todoItems: [] }
const localStorageKey = 'todoListState'

export const TodoItemsContextProvider = ({
  children,
}: {
  children?: ReactNode
}) => {
  const [state, dispatch] = useReducer(todoItemsReducer, defaultState)

  useEffect(() => {
    const savedState = localStorage.getItem(localStorageKey)

    if (savedState) {
      try {
        dispatch({ type: 'loadState', data: JSON.parse(savedState) })
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state))
  }, [state])

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TodoItemsContext.Provider>
  )
}

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext)

  if (!todoItemsContext) {
    throw new Error(
      'useTodoItems hook should only be used inside TodoItemsContextProvider'
    )
  }

  return todoItemsContext
}

function todoItemsReducer(state: TodoItemsState, action: TodoItemsAction) {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'loadState':
        draft.todoItems = action.data.todoItems
        break
      case 'add':
        draft.todoItems.push({
          id: generateId(),
          done: false,
          ...action.data.todoItem,
        })
        break
      case 'delete':
        draft.todoItems = draft.todoItems.filter(
          ({ id }) => id !== action.data.id
        )
        break
      case 'toggleDone':
        draft.todoItems = draft.todoItems.map((i) => {
          if (i.id === action.data.id) {
            i.done = !i.done
          }
          return i
        })
        break
      case 'edit':
        draft.todoItems = draft.todoItems.map((i) => {
          if (i.id === action.data.todoItem.id) {
            i.title = action.data.todoItem.title
            i.details = action.data.todoItem.details
          }
          return i
        })
        break
      default:
        throw new Error()
    }
  })
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e16
  ).toString(36)}`
}
