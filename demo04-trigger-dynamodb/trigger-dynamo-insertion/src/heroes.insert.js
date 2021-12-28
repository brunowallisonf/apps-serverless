const uuid = require("uuid")
const Joi = require("@hapi/joi")
const decoratorValidator = require("./util/decoratorValidator");
const globalEnum = require("./util/globalEnum")
class Handler {
    constructor({ dynamoDB }) {
        this.dynamoDb = dynamoDB;
        this.dynamoDbTable = process.env.DINAMODB_TABLE
    }

    prepareData(data) {
        const params = {
            TableName: this.dynamoDbTable,
            Item: {
                ...data,
                id: uuid.v1(),
                createdAt: new Date().toISOString(),
            }
        }
        return params;
    }
    static validator() {
        return Joi.object({
            nome: Joi.string().max(100).min(2).required(),
            poder: Joi.string().max(100).min(2).required(),
        })
    }
    handleSuccess(data) {
        const response = {
            statusCode: 200,
            body: JSON.stringify(data)
        }
        return response;
    }

    handlerFailure(data) {
        return {
            statusCode: data.statusCode || 501,
            headers: { "Content-Type": "text/plain" },
            body: "Couldn't create item"
        }
    }
    async insertItem(params) {
        return this.dynamoDb.put(params).promise()
    }
    async main(event) {
        try {

            const dbParams = this.prepareData(event.body);

            const result = await this.insertItem(dbParams);
            return this.handleSuccess(result)
        } catch (error) {
            console.log("Deu ruim**", error);
            return this.handlerFailure({ statusCode: 500 })
        }


    }
}
const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB.DocumentClient()

const handler = new Handler({ dynamoDB });

module.exports = decoratorValidator(handler.main.bind(handler), Handler.validator(), globalEnum.enumParams.ARG_TYPE.BODY);