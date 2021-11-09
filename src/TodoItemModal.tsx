import { TodoItem, useTodoItems } from './TodoItemsContext'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Button, Modal, TextField } from '@material-ui/core'
import { useForm, Controller } from 'react-hook-form'

const useModalStyles = makeStyles((theme) => ({
  box: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: theme.palette.background.paper,
    width: 512,
    padding: theme.spacing(4),
  },
  input: {
    marginBottom: 24,
  },
}))

interface TodoItemModalProps {
  open: boolean
  item: TodoItem
  handleClose: () => void
}

function TodoItemModal({ open, item, handleClose }: TodoItemModalProps) {
  const classes = useModalStyles()
  const { dispatch } = useTodoItems()
  const { control, handleSubmit } = useForm()

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className={classes.box}>
        <form
          onSubmit={handleSubmit<{
            title: string
            details: string
          }>((formData) => {
            dispatch({
              type: 'edit',
              data: { todoItem: { ...formData, id: item.id } },
            })
            handleClose()
          })}
        >
          <Controller
            name="title"
            control={control}
            defaultValue={item.title}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                label="TODO"
                fullWidth={true}
                className={classes.input}
              />
            )}
          />
          <Controller
            name="details"
            control={control}
            defaultValue={item.details}
            render={({ field }) => (
              <TextField
                {...field}
                label="Details"
                fullWidth={true}
                multiline={true}
                className={classes.input}
              />
            )}
          />
          <Button variant="contained" color="primary" type="submit">
            Edit
          </Button>
        </form>
      </Box>
    </Modal>
  )
}

export default TodoItemModal
