import { APIGatewayProxyHandler } from 'aws-lambda'
import { v4 as uuid } from 'uuid'
import { LoanStatus } from '../../entities/loan.entity'
import HttpErrors from 'http-errors'
import { getValidEventBody } from '../../../utils/validation'
import axios from 'axios'
import { handleError } from '../../../utils/errorHandling'
import { bodySchema } from './schemas'
import { createLoan } from '../../services/dynamoDB'

const OPENKVK_ENDPOINT = process.env.OPENKVK_ENDPOINT
const OPENKVK_API_KEY = process.env.OPENKVK_API_KEY

if (!OPENKVK_ENDPOINT || !OPENKVK_API_KEY) {
  throw new Error('One or more environment variables are not defined')
}

const opekvkService = axios.create({
  baseURL: OPENKVK_ENDPOINT,
  headers: {
    'ovio-api-key': OPENKVK_API_KEY,
  },
})

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = uuid()

  try {
    const { amount, openkvkId } = getValidEventBody(event, bodySchema)

    const { data: companyData } = await opekvkService.get(`/${openkvkId}`)

    if (!companyData.actief)
      throw new HttpErrors.BadRequest(
        'Company for the provided id is inactive. You must provide an id for an active company',
      )

    await createLoan(id, amount, companyData)

    return {
      statusCode: 201,
      body: JSON.stringify({
        data: {
          id,
          amount,
          status: LoanStatus.OFFERED,
          companyData: JSON.stringify(companyData),
        },
      }),
    }
  } catch (e) {
    return handleError(e)
  }
}
