import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import { LoanStatus } from '../../entities/loan.entity'
import Joi from 'joi'
import HttpErrors from 'http-errors'
import { getValidEventBody } from '../../../utils/validation'

const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT

if (!LOANS_TABLE || !DYNAMODB_REGION || !DYNAMODB_ENDPOINT) {
  throw new Error('One or more environment variables are not defined')
}
const dynamoDb = new DynamoDB({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

const bodySchema = Joi.object({
  amount: Joi.number()
    .required()
    .greater(0)
    .messages({
      'number.greater':
        'Invalid body parameter value: amount must be greater than 0',
      'number.base': 'Invalid body parameter value: amount must be a number',

      'any.required': 'Missing required body parameter: amount',
    }),
})

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = uuid()

  try {
    const { amount } = getValidEventBody(event, bodySchema)
    await dynamoDb
      .putItem({
        TableName: LOANS_TABLE,
        Item: {
          id: {
            S: id,
          },
          amount: {
            N: amount.toString(),
          },
          status: {
            S: LoanStatus.OFFERED,
          },
        },
      })
      .promise()
    return {
      statusCode: 201,
      body: JSON.stringify({
        data: {
          id,
          amount,
          status: LoanStatus.OFFERED,
        },
      }),
    }
  } catch (e) {
    if (HttpErrors.isHttpError(e)) {
      return {
        statusCode: e.statusCode,
        body: e.message,
      }
    }

    return {
      statusCode: 500,
      body: e instanceof Error ? JSON.stringify(e.stack) : JSON.stringify(e),
    }
  }
}
