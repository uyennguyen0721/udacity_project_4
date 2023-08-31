import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateImage } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { AttachmentUtils } from '../../helpers/attachmentUtils'

const attachment = new AttachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

    const userId = getUserId(event)

    const attachmentUrl: string = attachment.getAttachmentUrl(todoId)

    await updateImage(
      userId,
      todoId,
      attachmentUrl
    )

    return {
      statusCode: 204,
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
