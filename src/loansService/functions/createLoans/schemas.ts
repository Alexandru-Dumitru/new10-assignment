import Joi from 'joi'

export const bodySchema = Joi.object({
  openkvkId: Joi.string()
    .required()
    .messages({
      'any.required': 'Missing required body parameter: "openkvkId"',
    }),
  amount: Joi.number()
    .required()
    .greater(0)
    .messages({
      'number.greater':
        'Invalid body parameter value: "amount" must be greater than 0',
      'number.base': 'Invalid body parameter value: "amount" must be a number',

      'any.required': 'Missing required body parameter: "amount"',
    }),
})
