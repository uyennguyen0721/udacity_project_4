import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
var AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(

        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosCreatedAtIndex = process.env.INDEX_NAME
    ) { }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        if (userId) {
            logger.info("Ready to get all todos");

            const todos = await this.docClient.query({
                TableName: this.todosTable,
                IndexName: this.todosCreatedAtIndex,
                KeyConditionExpression: "#userId = :userId",
                ExpressionAttributeNames: {
                    "#userId": "userId"
                },
                ExpressionAttributeValues: {
                    ":userId": userId
                }
            }).promise();

            logger.info(`Query successfully ${todos.Items}`);

            return todos.Items as TodoItem[];
        } else {
            logger.error(`Unauthenticated operation`);
        }
    }

    async createTodoItem(todo: TodoItem): Promise<TodoItem> {
        logger.info("Ready to add a new todo")

        const result = await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        logger.info('todo created', result);

        return todo as TodoItem;
    }

    public async updateTodo(userId: string, todoId: string, todo: TodoUpdate) {
        if (userId) {
            logger.info(`Found todo ${todoId}, ready for update`);

            await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    userId
                },
                UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
                ExpressionAttributeNames: {
                    "#name": "name",
                    "#dueDate": "dueDate",
                    "#done": "done"
                },
                ExpressionAttributeValues: {
                    ":name": todo.name,
                    ":dueDate": todo.dueDate,
                    ":done": todo.done
                }
            }).promise();

            logger.info("Updated successfull ", todo)
        } else {
            logger.error(`Unauthenticated operation`);
        }
    }

    async deleteTodo(userId: string, todoId: string): Promise<string> {
        if (userId) {
            logger.info(`Ready to delete todo ${todoId}`);

            const result = await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    userId
                }
            }).promise();

            logger.info("Delete successful", result);

            return todoId as string

        } else {
            logger.error("Unauthenticated operation");
        }
    }

    async updateTodoAttachmentUrl(
        userId: string,
        todoId: string,
        attachmentUrl: string

    ): Promise<void> {
        logger.info("Update to do attachment url")

        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    userId
                },
                UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
                ExpressionAttributeNames: {
                    "#attachmentUrl": "attachmentUrl"
                },
                ExpressionAttributeValues: {
                    ':attachmentUrl': attachmentUrl
                }
            })
            .promise()

    }
}