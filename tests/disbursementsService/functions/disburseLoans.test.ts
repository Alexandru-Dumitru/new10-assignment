/* eslint-disable node/no-unpublished-import */
import LambdaTester from 'lambda-tester'
import { handler } from '../../../src/disbursementsService/functions/disburseLoans'
import { LoanStatus } from '../../../src/disbursementsService/entities/loan.entity'
import nock from 'nock'

describe('Disburse Loans', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('Returns 201 and a loan entity with updated status', async () => {
    // Arrange
    const validInputEvent = {
      body: JSON.stringify({
        status: LoanStatus.DISBURSED,
      }),
      pathParameters: {
        id: '1',
      },
    }

    const expectedResult = {
      statusCode: 201,
      body: JSON.stringify({
        data: {
          id: '1',
          status: LoanStatus.DISBURSED,
        },
      }),
    }

    nock('http://localhost:8000', { encodedQueryParams: true })
      .post('/', {
        TableName: 'loansTable',
        Key: { id: { S: '1' } },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': { S: 'DISBURSED' } },
        ReturnValues: 'ALL_NEW',
      })
      .reply(200, {
        Attributes: { id: { S: '1' }, status: { S: 'DISBURSED' } },
      })

    //Act
    await LambdaTester(handler)
      .event(validInputEvent as any)
      .expectResult((result) => {
        // Assert
        expect(result).toEqual(expectedResult)
      })
  })
  it('Returns 400 with body validation error', async () => {
    // Arrange
    const invalidInputEvent = {
      body: JSON.stringify({
        status: 'WRONG_INPUT',
      }),
      pathParameters: {
        id: '1',
      },
    }

    const expectedResult = {
      statusCode: 400,
      body:
        'Invalid body parameter value: "status" must be one of ["DISBURSED"]',
    }

    //Act
    await LambdaTester(handler)
      .event(invalidInputEvent as any)
      .expectResult((result) => {
        // Assert
        expect(result).toEqual(expectedResult)
      })
  })
})
