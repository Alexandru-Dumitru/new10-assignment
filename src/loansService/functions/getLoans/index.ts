import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import {} from 'dynamodb'
// import Joi from 'joi'

const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT

const dynamoDb = new DynamoDB({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

export const handler: APIGatewayProxyHandler = async () => {
  try {
    //TODO param and env var validation here!!

    const data = await dynamoDb
      .scan({
        TableName: LOANS_TABLE!,
      })
      .promise()
    //TODO pagination => Check lastEvaluatedKey
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: data.Items,
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
