import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'
import {} from 'dynamodb'
// import Joi from 'joi'
import { v4 as uuid } from 'uuid'

enum LoanStatus {
    OFFERED = 'OFFERED',
    DISBURSED = 'DISBURSED',
}
const LOANS_TABLE = process.env.LOANS_TABLE_NAME

const dynamoDb = new DynamoDB({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
})

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        //TODO - init of table must be moved away from here. Belongs in serverless.yaml
        // dynamo.AWS.config.update({
        //     region: 'localhost',
        //     endpoint: 'http://localhost:8000',
        // })

        // var Loan = dynamo.define('Loan', {
        //     hashKey: 'id',
        //     timestamps: true,
        //     schema: {
        //         id: dynamo.types.uuid(),
        //         amount: Joi.number().required(),
        //         status: Joi.bool(),
        //     },
        // })

        // await new Promise((resolve, reject) => {
        //     dynamo.createTables((err: any) => (err ? reject(err) : resolve()))
        // })

        //TODO param and env var validation here!!

        const amount = event.pathParameters?.amount
        const id = uuid()
        await dynamoDb
            .putItem({
                TableName: LOANS_TABLE!,
                Item: {
                    id: {
                        S: id,
                    },
                    amount: {
                        N: amount,
                    },
                    status: {
                        S: LoanStatus.OFFERED,
                    },
                },
            })
            .promise()
        return {
            statusCode: 200,
            body: JSON.stringify({
                data: {
                    id,
                    amount,
                    status: LoanStatus.OFFERED,
                },
            }),
        }
        // return await new Promise((resolve, reject) => {
        //     Loan.create({ amount, status: OFFERED }, function(err, loan) {
        //         err && reject(err)

        //         resolve({
        //             statusCode: 200,
        //             body: JSON.stringify(loan),
        //         })
        //     })
        // })
    } catch (e) {
        //TODO validate something here ?!?
        return {
            statusCode: 500,
            body: JSON.stringify((e as any).stack),
        }
    }
}
