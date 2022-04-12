import { DynamoDB } from 'aws-sdk'
import { LoanStatus } from '../entities/loan.entity'

const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT

if (!LOANS_TABLE || !DYNAMODB_REGION || !DYNAMODB_ENDPOINT) {
  throw new Error('One or more environment variables are not defined')
}

const documentClient = new DynamoDB.DocumentClient({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

export const updateLoanStatus = async (id: string, status: LoanStatus) => {
  const disburseLoanParams = {
    TableName: LOANS_TABLE,
    Key: {
      id,
    },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': status,
    },
    ReturnValues: 'ALL_NEW',
  }

  const loan = await documentClient.update(disburseLoanParams).promise()

  return loan.Attributes
}
