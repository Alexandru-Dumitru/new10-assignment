/* eslint-disable node/no-unpublished-import */

jest.mock('uuid', () => {
  return {
    v4: jest
      .fn()
      .mockImplementation(() => 'ba75523a-06f7-4267-ba6c-47fd35e2ec24'),
  }
})

import LambdaTester from 'lambda-tester'
import { handler } from '../../../src/loansService/functions/createLoans'
import { LoanStatus } from '../../../src/loansService/entities/loan.entity'
import nock from 'nock'

describe('Loans Service - Create Loans', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('Returns 201 and a loan entity', async () => {
    // Arrange
    const validInputEvent = {
      body: JSON.stringify({
        amount: 100,
        openkvkId: 'rechtspersoon-37118328-de-goede-inspecties-bv',
      }),
    }

    const companyData = {
      website: null,
      btw: 'NL814846099B01',
      datum_oprichting: '2005-01-01',
      dossiernummer: '37118328',
      werknemers: 4,
      non_mailing_indicatie: false,
      omschrijving:
        'Uitvoeren van veiligheidsinspecties aan gasinstallaties; verrichten van emissie- metingen aan stookgasinstallaties en rookgasreinigers; adviesbureau op het gebied van veilig en doelmatig energieverbruik',
      rsin: '814846099',
      updated_at: '2020-05-26',
      subtype: 'Rechtspersoon',
      actief: true,
      sbi: [7112],
      handelsnaam: 'De Goede Inspecties B.V.',
      _links: {
        self: {
          href: '/openkvk/rechtspersoon-37118328-de-goede-inspecties-bv',
        },
      },
    }
    const expectedResult = {
      statusCode: 201,
      body: JSON.stringify({
        data: {
          id: 'ba75523a-06f7-4267-ba6c-47fd35e2ec24',
          amount: 100,
          status: LoanStatus.OFFERED,
          companyData: JSON.stringify(companyData),
        },
      }),
    }

    const openkvkScope = nock('https://api.overheid.io:443', {
      encodedQueryParams: true,
    })
      .persist()
      .get('/openkvk/rechtspersoon-37118328-de-goede-inspecties-bv')
      .reply(200, companyData)

    const dynamoScope = nock('http://localhost:8000', {
      encodedQueryParams: true,
    })
      .persist()
      .post('/', {
        TableName: 'loansTable',
        Item: {
          id: { S: 'ba75523a-06f7-4267-ba6c-47fd35e2ec24' },
          amount: { S: '100' },
          status: { S: 'OFFERED' },
          companyData: {
            M: {
              website: { NULL: true },
              btw: { S: 'NL814846099B01' },
              datum_oprichting: { S: '2005-01-01' },
              dossiernummer: { S: '37118328' },
              werknemers: { N: '4' },
              non_mailing_indicatie: { BOOL: false },
              omschrijving: {
                S:
                  'Uitvoeren van veiligheidsinspecties aan gasinstallaties; verrichten van emissie- metingen aan stookgasinstallaties en rookgasreinigers; adviesbureau op het gebied van veilig en doelmatig energieverbruik',
              },
              rsin: { S: '814846099' },
              updated_at: { S: '2020-05-26' },
              subtype: { S: 'Rechtspersoon' },
              actief: { BOOL: true },
              sbi: { L: [{ N: '7112' }] },
              handelsnaam: { S: 'De Goede Inspecties B.V.' },
              _links: {
                M: {
                  self: {
                    M: {
                      href: {
                        S:
                          '/openkvk/rechtspersoon-37118328-de-goede-inspecties-bv',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
      .reply(200, {})
    //Act
    await LambdaTester(handler)
      .event(validInputEvent as any)
      .expectResult((result) => {
        // Assert
        expect(result).toEqual(expectedResult)
      })
    dynamoScope.persist(false)
    openkvkScope.persist(false)
  })
  it('Returns 400 with body validation error', async () => {
    // Arrange
    const invalidInputEvent = {
      body: JSON.stringify({
        amount: 0,
        openkvkId: 'rechtspersoon-37118328-de-goede-inspecties-bv',
      }),
    }

    const expectedResult = {
      statusCode: 400,
      body: 'Invalid body parameter value: "amount" must be greater than 0',
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
