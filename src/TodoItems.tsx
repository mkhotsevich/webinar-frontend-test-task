import { useCallback, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import { motion } from 'framer-motion'
import { TodoItem, useTodoItems } from './TodoItemsContext'
import TodoItemModal from './TodoItemModal'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd'

const spring = {
  type: 'spring',
  damping: 25,
  stiffness: 120,
  duration: 0.25,
}

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: 'none',
    padding: 0,
  },
})

export const TodoItemsList = function () {
  const { todoItems, dispatch } = useTodoItems()

  const classes = useTodoItemListStyles()

  const sortedItems = todoItems.slice().sort((a, b) => {
    if (a.done && !b.done) {
      return 1
    }
    if (!a.done && b.done) {
      return -1
    }
    return 0
  })

  const handlerDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(todoItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    dispatch({ type: 'loadState', data: { todoItems: items } })
  }

  return (
    <DragDropContext onDragEnd={handlerDragEnd}>
      <Droppable droppableId="todos">
        {(provided) => (
          <ul
            className={classes.root}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {sortedItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <li
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    {...provided.dragHandleProps}
                  >
                    <TodoItemCard item={item} />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  )
}

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: 'line-through',
    color: '#888888',
  },
})

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const classes = useTodoItemCardStyles()
  const { dispatch } = useTodoItems()
  const [isEdit, setIsEdit] = useState(false)

  const handleDelete = useCallback(
    () => dispatch({ type: 'delete', data: { id: item.id } }),
    [item.id, dispatch]
  )

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: 'toggleDone',
        data: { id: item.id },
      }),
    [item.id, dispatch]
  )

  const handlerEdit = () => {
    setIsEdit(true)
  }

  const handleClose = () => {
    setIsEdit(false)
  }

  return (
    <>
      <Card
        className={classnames(classes.root, {
          [classes.doneRoot]: item.done,
        })}
      >
        <CardHeader
          action={
            <>
              <IconButton aria-label="edit" onClick={handlerEdit}>
                <EditIcon />
              </IconButton>
              <IconButton aria-label="delete" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </>
          }
          title={
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.done}
                  onChange={handleToggleDone}
                  name={`checked-${item.id}`}
                  color="primary"
                />
              }
              label={item.title}
            />
          }
        />
        {item.details ? (
          <CardContent>
            <Typography variant="body2" component="p">
              {item.details}
            </Typography>
          </CardContent>
        ) : null}
      </Card>
      <TodoItemModal open={isEdit} item={item} handleClose={handleClose} />
    </>
  )
}
