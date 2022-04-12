import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
// import Joi from 'joi'

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

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const data = await dynamoDb
      .scan({
        TableName: LOANS_TABLE,
      })
      .promise()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: data.Items,
      }),
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: e instanceof Error ? JSON.stringify(e.stack) : JSON.stringify(e),
    }
  }
}
