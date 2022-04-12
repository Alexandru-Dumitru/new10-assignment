import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import Joi from 'joi'
import { getValidEventBody } from '../../../utils/validation'
import { LoanStatus } from '../../entities/loan.entity'
import HttpErrors from 'http-errors'

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
  status: Joi.string()
    .required()
    .insensitive()
    .valid(LoanStatus.DISBURSED)
    .messages({
      'any.only':
        'Invalid body parameter value: "status" must be one of ["DISBURSED"]',
      'any.required': 'Missing required body parameter: "status',
    }),
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    const { status } = getValidEventBody(event, bodySchema)

    if (status && status !== LoanStatus.DISBURSED) {
      return {
        statusCode: 400,
        body: 'Invalid body value. Accepted value is: DISBURSED',
      }
    }

    const result = await dynamoDb
      .updateItem({
        TableName: LOANS_TABLE,
        Key: {
          id: {
            S: id,
          },
        },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': {
            S: LoanStatus.DISBURSED,
          },
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise()
    return {
      statusCode: 201,
      body: JSON.stringify({
        data: result.Attributes,
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
