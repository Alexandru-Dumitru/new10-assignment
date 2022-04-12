import { APIGatewayProxyHandler } from 'aws-lambda'
import axios from 'axios'
import Joi from 'joi'
import { getValidEventBody } from '../../../utils/validation'
import { LoanStatus } from '../../entities/loan.entity'
import { handleError } from '../../../utils/errorHandling'
import { getLoan } from '../../services/dynamoDB'

const DISBURSEMENTS_SERVICE_URL = process.env.DISBURSEMENTS_SERVICE_URL

if (!DISBURSEMENTS_SERVICE_URL) {
  throw new Error('One or more environment variables are not defined')
}

const disbursementsService = axios.create({
  baseURL: DISBURSEMENTS_SERVICE_URL,
})

const bodySchema = Joi.object({
  status: Joi.string()
    .required()
    .insensitive()
    .valid(LoanStatus.DISBURSED)
    .messages({
      'any.only':
        'Invalid body parameter value: "status" must be one of ["DISBURSED"]',
      'any.required': 'Missing required body parameter: "status',
    }),
})

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    const { status } = getValidEventBody(event, bodySchema)

    const loan = await getLoan(id!)

    const result = await disbursementsService.put(`/loans/${loan.id}/status`, {
      status,
    })

    return {
      statusCode: 200,
      body: JSON.stringify(result.data),
    }
  } catch (e) {
    return handleError(e)
  }
}
