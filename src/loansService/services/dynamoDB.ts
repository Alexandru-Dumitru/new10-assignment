import { LoanStatus } from '../entities/loan.entity'
import HttpErrors from 'http-errors'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const LOANS_TABLE = process.env.LOANS_TABLE_NAME
const DYNAMODB_REGION = process.env.DYNAMODB_REGION
const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT

if (!LOANS_TABLE || !DYNAMODB_REGION || !DYNAMODB_ENDPOINT) {
  throw new Error('One or more environment variables are not defined')
}

const documentClient = new DocumentClient({
  region: DYNAMODB_REGION,
  endpoint: DYNAMODB_ENDPOINT,
})

export const createLoan = async (
  id: string,
  amount: number,
  companyData: any,
) => {
  const createloanDbParams = {
    TableName: LOANS_TABLE,
    Item: {
      id,
      amount: amount.toString(),
      status: LoanStatus.OFFERED,
      companyData,
    },
  }

  return documentClient.put(createloanDbParams).promise()
}

export const deleteLoan = async (id: string) => {
  const result = await documentClient
    .delete({
      TableName: LOANS_TABLE,
      Key: {
        id,
      },
      ReturnValues: 'ALL_OLD',
    })
    .promise()

  if (!result.Attributes) {
    throw new HttpErrors.NotFound()
  }

  return result.Attributes
}

export const getLoans = async () => {
  const result = await documentClient
    .scan({
      TableName: LOANS_TABLE,
    })
    .promise()
  return result.Items
}

export const getLoan = async (id: string) => {
  const result = await documentClient
    .get({
      TableName: LOANS_TABLE,
      Key: { id },
    })
    .promise()

  if (!result.Item) throw new HttpErrors.NotFound()

  return result.Item
}
