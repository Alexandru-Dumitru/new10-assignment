import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
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

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    const result = await dynamoDb
      .deleteItem({
        TableName: LOANS_TABLE,
        Key: {
          id: {
            S: id,
          },
        },
        ReturnValues: 'ALL_OLD',
      })
      .promise()

    if (!result.Attributes) {
      throw new HttpErrors.NotFound()
    }

    return {
      statusCode: 200,
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
