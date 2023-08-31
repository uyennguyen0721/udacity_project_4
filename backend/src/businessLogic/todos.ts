import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
//import { loggers } from 'winston';

// TODO: Implement businessLogic

const log = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

//get todos funciton

export async function getTodosForUser(
    userId: string
): Promise<TodoItem[]> {
    log.info('Get todos for user')
    return todosAccess.getAllTodos(userId)
}

//create todo
export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    log.info("Function Create TO DO")

    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    // const s3AttachmenUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem: TodoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: null,
        ...newTodo
    }

    return await todosAccess.createTodoItem(newItem)
}

// update todo
export async function updateTodo(
    userId: string,
    todoId: string,
    todoUpdate: UpdateTodoRequest
) {
    log.info('update todo for user')
    await todosAccess.updateTodo(userId, todoId, todoUpdate)
}

// delete todo

export async function deleteTodo(
    userId: string,
    todoId: string,
): Promise<string> {
    log.info('delete todo')
    return todosAccess.deleteTodo(userId, todoId)
}

//create attachment 

export async function createAttachmentPresignedUrl(
    userId: string,
    todoId: string,
): Promise<string> {
    log.info('create attachment', userId, todoId)
    return attachmentUtils.getUploadUrl(todoId)
}

export async function updateImage(
    userId: string,
    todoId: string,
    attachmentUrl: string
) {
    log.info('create attachment', userId, todoId)
    await todosAccess.updateTodoAttachmentUrl(userId, todoId, attachmentUrl)
}
