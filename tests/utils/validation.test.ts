import { APIGatewayProxyEvent } from 'aws-lambda'
import Joi from 'joi'
import { getValidEventBody } from '../../src/utils/validation'

describe('Validation', () => {
  it('Returns a validated event based on a provided schema', async () => {
    // Arrange
    const bodySchema = Joi.object({
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
          'number.base':
            'Invalid body parameter value: "amount" must be a number',

          'any.required': 'Missing required body parameter: "amount"',
        }),
    })

    const validBody = {
      amount: 1,
      openkvkId: 'id',
    }

    const validEvent = {
      body: JSON.stringify(validBody),
    }
    // Act
    const result = getValidEventBody(
      validEvent as APIGatewayProxyEvent,
      bodySchema,
    )
    // Assert

    expect(result).toStrictEqual(validBody)
  }),
    it('Throws is "body" is missing from the event object', async () => {
      // Arrange
      const bodySchema = Joi.object({
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
            'number.base':
              'Invalid body parameter value: "amount" must be a number',

            'any.required': 'Missing required body parameter: "amount"',
          }),
      })

      const validEvent = {
        body: undefined,
      }
      // Act
      try {
        getValidEventBody(
          (validEvent as unknown) as APIGatewayProxyEvent,
          bodySchema,
        )
      } catch (err) {
        // Assert
        expect((err as any).message).toEqual('Missing JSON body')
      }
    }),
    it('Throws is "amount" is missing from the body of the event object', async () => {
      // Arrange
      const bodySchema = Joi.object({
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
            'number.base':
              'Invalid body parameter value: "amount" must be a number',

            'any.required': 'Missing required body parameter: "amount"',
          }),
      })

      const validBody = {
        openkvkId: 'id',
      }

      const invalidEvent = {
        body: JSON.stringify(validBody),
      }
      // Act
      try {
        getValidEventBody(
          (invalidEvent as unknown) as APIGatewayProxyEvent,
          bodySchema,
        )
      } catch (err) {
        // Assert
        expect((err as any).message).toEqual(
          'Missing required body parameter: "amount"',
        )
      }
    })
})
