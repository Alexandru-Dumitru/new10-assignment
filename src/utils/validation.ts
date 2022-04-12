import Joi from 'joi'
import HttpErrors from 'http-errors'
import { APIGatewayProxyEvent } from 'aws-lambda'

export const getValidEventBody = (
  event: APIGatewayProxyEvent,
  bodySchema: Joi.Schema,
) => {
  if (!event.body) throw new HttpErrors.BadRequest('Missing JSON body')

  const validEvent = bodySchema.validate(JSON.parse(event.body))
  if (validEvent.error === undefined) return validEvent.value
  console.table(validEvent.error.details)
  throw new HttpErrors.BadRequest(validEvent.error.message)
}
