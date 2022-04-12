import Joi from 'joi'
import { LoanStatus } from '../../entities/loan.entity'

export const bodySchema = Joi.object({
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
