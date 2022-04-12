import { APIGatewayProxyHandler } from 'aws-lambda'
import axios from 'axios'
import Joi from 'joi'
import { DynamoDB } from 'aws-sdk'
import { getValidEventBody } from '../../../utils/validation'
import { LoanStatus } from '../../entities/loan.entity'
import HttpErrors from 'http-errors'

const DISBURSEMENTS_SERVICE_URL = process.env.DISBURSEMENTS_SERVICE_URL
const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT

if (
  !LOANS_TABLE ||
  !DYNAMODB_REGION ||
  !DYNAMODB_ENDPOINT ||
  !DISBURSEMENTS_SERVICE_URL
) {
  throw new Error('One or more environment variables are not defined')
}
const dynamoDb = new DynamoDB({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

const disbursementsService = axios.create({
  baseURL: DISBURSEMENTS_SERVICE_URL,
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

    const loanData = await dynamoDb
      .getItem({
        TableName: LOANS_TABLE,
        Key: {
          id: {
            S: id,
          },
        },
      })
      .promise()

    if (!loanData.Item) throw new HttpErrors.NotFound()

    const result = await disbursementsService.put(`/loans/${id}/status`, status)

    return {
      statusCode: 200,
      body: JSON.stringify(result.data),
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
