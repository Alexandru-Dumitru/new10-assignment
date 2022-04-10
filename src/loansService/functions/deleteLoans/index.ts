import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
// import Joi from 'joi'
const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT

const dynamoDb = new DynamoDB({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    const result = await dynamoDb
      .deleteItem({
        TableName: LOANS_TABLE!,
        Key: {
          id: {
            S: id,
          },
        },
        ReturnValues: 'ALL_OLD',
      })
      .promise()
    return {
      statusCode: 200,
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
