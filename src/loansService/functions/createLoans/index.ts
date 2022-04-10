import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import {} from 'dynamodb'
// import Joi from 'joi'
import { v4 as uuid } from 'uuid'
import { LoanStatus } from '../../entities/loan.entity'

const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT

const dynamoDb = new DynamoDB({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    //TODO param and env var validation here!!
    //TODO move amount to body of the request!
    const { amount } = JSON.parse(event.body!)
    const id = uuid()
    await dynamoDb
      .putItem({
        TableName: LOANS_TABLE!,
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
    //TODO validate something here ?!?
    return {
      statusCode: 500,
      body: JSON.stringify((e as any).stack),
    }
  }
}
