/* eslint-disable node/no-unpublished-import */
import LambdaTester from 'lambda-tester'
import { handler } from '../../../src/loansService/functions/updateLoans'
import { LoanStatus } from '../../../src/loansService/entities/loan.entity'
import nock from 'nock'

describe('Loans Service - Update Loans', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('Returns 200 and the updated loan entity', async () => {
    // Arrange
    const validInputEvent = {
      body: JSON.stringify({
        status: LoanStatus.DISBURSED,
      }),
      pathParameters: {
        id: '151233f8-3d1d-48aa-be28-8cf5467a84c8',
      },
    }

    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify({
        data: {
          amount: '100',
          id: '151233f8-3d1d-48aa-be28-8cf5467a84c8',
          companyData: {
            website: null,
            btw: 'NL814846099B01',
            _links: {
              self: {
                href: '/openkvk/rechtspersoon-37118328-de-goede-inspecties-bv',
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
          status: LoanStatus.DISBURSED,
        },
      }),
    }

    nock('http://localhost:8000', { encodedQueryParams: true })
      .post('/', {
        TableName: 'loansTable',
        Key: { id: { S: '151233f8-3d1d-48aa-be28-8cf5467a84c8' } },
      })
      .reply(200, {
        Item: {
          amount: { S: '100' },
          id: { S: '151233f8-3d1d-48aa-be28-8cf5467a84c8' },
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
      })

    nock('http://localhost:3000', { encodedQueryParams: true })
      .put('/dev/loans/151233f8-3d1d-48aa-be28-8cf5467a84c8/status', {
        status: 'DISBURSED',
      })
      .reply(201, {
        data: {
          amount: '100',
          id: '151233f8-3d1d-48aa-be28-8cf5467a84c8',
          companyData: {
            website: null,
            btw: 'NL814846099B01',
            _links: {
              self: {
                href: '/openkvk/rechtspersoon-37118328-de-goede-inspecties-bv',
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
          status: 'DISBURSED',
        },
      })
    //Act
    await LambdaTester(handler)
      .event(validInputEvent as any)
      .expectResult((result) => {
        // Assert
        expect(result).toStrictEqual(expectedResult)
      })
  })
})
