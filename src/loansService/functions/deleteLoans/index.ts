import { APIGatewayProxyHandler } from 'aws-lambda'
import { handleError } from '../../../utils/errorHandling'
import { deleteLoan } from '../../services/dynamoDB'

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id

    const data = await deleteLoan(id!)
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
