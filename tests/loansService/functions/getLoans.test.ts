/* eslint-disable node/no-unpublished-import */
import LambdaTester from 'lambda-tester'
import { handler } from '../../../src/loansService/functions/getLoans'
import { LoanStatus } from '../../../src/loansService/entities/loan.entity'
import nock from 'nock'

describe('Loans Service - Get Loans', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('Returns 200 and an array of loan entities', async () => {
    // Arrange
    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify({
        data: [
          {
            amount: '100',
            id: 'b65910fa-6922-4c72-aecc-1697a33db80b',
            companyData: {
              website: null,
              btw: 'NL814846099B01',
              _links: {
                self: {
                  href:
                    '/openkvk/rechtspersoon-37118328-de-goede-inspecties-bv',
                },
              },
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
            },
            status: LoanStatus.OFFERED,
          },
        ],
      }),
    }

    nock('http://localhost:8000', { encodedQueryParams: true })
      .post('/', { TableName: 'loansTable' })
      .reply(200, {
        Items: [
          {
            amount: { S: '100' },
            id: { S: 'b65910fa-6922-4c72-aecc-1697a33db80b' },
            companyData: {
              M: {
                website: { NULL: true },
                btw: { S: 'NL814846099B01' },
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
              },
            },
            status: { S: 'OFFERED' },
          },
        ],
        Count: 1,
        ScannedCount: 1,
      })

    //Act
    await LambdaTester(handler)
      .event({} as any)
      .expectResult((result) => {
        // Assert
        expect(result).toStrictEqual(expectedResult)
      })
  })
})
