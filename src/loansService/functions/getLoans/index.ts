import { APIGatewayProxyHandler } from 'aws-lambda'
import { handleError } from '../../../utils/errorHandling'
import { getLoans } from '../../services/dynamoDB'
// import Joi from 'joi'

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const data = await getLoans()

    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
      }),
    }
  } catch (e) {
    return handleError(e)
  }
}
