import { APIGatewayProxyHandler } from 'aws-lambda'
import axios from 'axios'
// import Joi from 'joi'
import { LoanStatus } from '../../entities/loan.entity'

const DISBURSEMENTS_SERVICE_URL = process.env.DISBURSEMENTS_SERVICE_URL

const disbursementsService = axios.create({
  baseURL: DISBURSEMENTS_SERVICE_URL,
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    //TODO param and env var validation here!!
    //TODO move amount to body of the request!
    const id = event.pathParameters?.id
    const status = JSON.parse(event.body!).status

    if (!status) {
      return {
        statusCode: 400,
        body: 'Missing mandatory body parameter: status',
      }
    }

    if (status && status !== LoanStatus.DISBURSED) {
      return {
        statusCode: 400,
        body:
          'Invalid value for body parameter: status. Accepted value is: DISBURSED',
      }
    }

    const result = await disbursementsService.put(`/loans/${id}/status`, status)

    return {
      statusCode: 200,
      body: JSON.stringify(result.data),
    }
  } catch (e) {
    //TODO validate something here ?!?
    return {
      statusCode: 500,
      body: JSON.stringify((e as any).stack),
    }
  }
}
