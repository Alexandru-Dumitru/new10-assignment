"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const validation_1 = require("../../src/utils/validation");
describe('Validation', () => {
    it('Returns a validated event based on a provided schema', async () => {
        // Arrange
        const bodySchema = joi_1.default.object({
            openkvkId: joi_1.default.string()
                .required()
                .messages({
                'any.required': 'Missing required body parameter: "openkvkId"',
            }),
            amount: joi_1.default.number()
                .required()
                .greater(0)
                .messages({
                'number.greater': 'Invalid body parameter value: "amount" must be greater than 0',
                'number.base': 'Invalid body parameter value: "amount" must be a number',
                'any.required': 'Missing required body parameter: "amount"',
            }),
        });
        const validBody = {
            amount: 1,
            openkvkId: 'id',
        };
        const validEvent = {
            body: JSON.stringify(validBody),
        };
        // Act
        const result = (0, validation_1.getValidEventBody)(validEvent, bodySchema);
        // Assert
        expect(result).toStrictEqual(validBody);
    }),
        it('Throws is "body" is missing from the event object', async () => {
            // Arrange
            const bodySchema = joi_1.default.object({
                openkvkId: joi_1.default.string()
                    .required()
                    .messages({
                    'any.required': 'Missing required body parameter: "openkvkId"',
                }),
                amount: joi_1.default.number()
                    .required()
                    .greater(0)
                    .messages({
                    'number.greater': 'Invalid body parameter value: "amount" must be greater than 0',
                    'number.base': 'Invalid body parameter value: "amount" must be a number',
                    'any.required': 'Missing required body parameter: "amount"',
                }),
            });
            const validEvent = {
                body: undefined,
            };
            // Act
            try {
                (0, validation_1.getValidEventBody)(validEvent, bodySchema);
            }
            catch (err) {
                // Assert
                expect(err.message).toEqual('Missing JSON body');
            }
        }),
        it('Throws is "amount" is missing from the body of the event object', async () => {
            // Arrange
            const bodySchema = joi_1.default.object({
                openkvkId: joi_1.default.string()
                    .required()
                    .messages({
                    'any.required': 'Missing required body parameter: "openkvkId"',
                }),
                amount: joi_1.default.number()
                    .required()
                    .greater(0)
                    .messages({
                    'number.greater': 'Invalid body parameter value: "amount" must be greater than 0',
                    'number.base': 'Invalid body parameter value: "amount" must be a number',
                    'any.required': 'Missing required body parameter: "amount"',
                }),
            });
            const validBody = {
                openkvkId: 'id',
            };
            const invalidEvent = {
                body: JSON.stringify(validBody),
            };
            // Act
            try {
                (0, validation_1.getValidEventBody)(invalidEvent, bodySchema);
            }
            catch (err) {
                // Assert
                expect(err.message).toEqual('Missing required body parameter: "amount"');
            }
        });
});
