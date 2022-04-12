import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import { LoanStatus } from '../../entities/loan.entity'
import Joi from 'joi'
import HttpErrors from 'http-errors'
import { getValidEventBody } from '../../../utils/validation'
import axios from 'axios'

const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT
const OPENKVK_ENDPOINT = process.env.OPENKVK_ENDPOINT
const OPENKVK_API_KEY = process.env.OPENKVK_API_KEY

if (
  !LOANS_TABLE ||
  !DYNAMODB_REGION ||
  !DYNAMODB_ENDPOINT ||
  !OPENKVK_ENDPOINT ||
  !OPENKVK_API_KEY
) {
  throw new Error('One or more environment variables are not defined')
}
const dynamoDb = new DynamoDB({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

const opekvkService = axios.create({
  baseURL: OPENKVK_ENDPOINT,
  headers: {
    'ovio-api-key': OPENKVK_API_KEY,
  },
})

const bodySchema = Joi.object({
  openkvkId: Joi.string()
    .required()
    .messages({
      'any.required': 'Missing required body parameter: "openkvkId"',
    }),
  amount: Joi.number()
    .required()
    .greater(0)
    .messages({
      'number.greater':
        'Invalid body parameter value: "amount" must be greater than 0',
      'number.base': 'Invalid body parameter value: "amount" must be a number',

      'any.required': 'Missing required body parameter: "amount"',
    }),
})

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = uuid()

  try {
    const { amount, openkvkId } = getValidEventBody(event, bodySchema)

    // get info about company
    // use rechtspersoon-37118062-stichting-mr-racing-support as test id
    //https://api.overheid.io/openkvk/rechtspersoon-37118062-stichting-mr-racing-support

    const { data: companyData } = await opekvkService.get(`/${openkvkId}`)

    if (!companyData.actief)
      throw new HttpErrors.BadRequest(
        'Company for the provided id is inactive. You must provide an id for an active company',
      )

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
          companyData: {
            S: JSON.stringify(companyData),
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
          companyData: JSON.stringify(companyData),
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

    if (axios.isAxiosError(e)) {
      return {
        statusCode: Number(e.code),
        body: e.message,
      }
    }
    return {
      statusCode: 500,
      body: e instanceof Error ? JSON.stringify(e.stack) : JSON.stringify(e),
    }
  }
}
