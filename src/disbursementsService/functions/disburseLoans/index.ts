import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
// import Joi from 'joi'
import { LoanStatus } from '../../entities/loan.entity'

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

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    //TODO param and env var validation here!!
    //TODO move amount to body of the request!
    const id = event.pathParameters?.id
    const status = event.body

    if (!status) {
      return {
        statusCode: 400,
        body: 'Body missing',
      }
    }

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
    //TODO validate something here ?!?
    return {
      statusCode: 500,
      body: JSON.stringify((e as any).stack),
    }
  }
}
