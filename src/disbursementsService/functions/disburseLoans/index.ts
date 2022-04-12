import { APIGatewayProxyHandler } from 'aws-lambda'
import { getValidEventBody } from '../../../utils/validation'
import { handleError } from '../../../utils/errorHandling'
import { updateLoanStatus } from '../../services/dynamoDB'
import { bodySchema } from './schemas'

const LOANS_TABLE = process.env.LOANS_TABLE_NAME

if (!LOANS_TABLE) {
  throw new Error('One or more environment variables are not defined')
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    const { status } = getValidEventBody(event, bodySchema)

    const loan = await updateLoanStatus(id!, status)
    return {
      statusCode: 201,
      body: JSON.stringify({
        data: loan,
      }),
    }
  } catch (e) {
    return handleError(e)
  }
}
