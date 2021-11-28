'use strict';

const axios = require("axios")
class Handler {
  constructor({ rekoSvc, translatorSvc }) {
    console.log(rekoSvc)
    this.rekoSvc = rekoSvc;
    this.translatorSvc = translatorSvc
  }

  async detectImageLabels(buffer) {
    console.log(this.rekoSvc)
    const result = await this.rekoSvc.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()

    const workingItems = result.Labels.filter(({ Confidence }) => Confidence > 80)
    const names = workingItems.map(({ Name }) => Name).join(" and ")
    return { names, workingItems }
  }
  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }
    const result = await this.translatorSvc.translateText(params).promise();
    console.log(result)
    return result.TranslatedText;
  }
  formatTextResults(texts, workingItems) {
    const finalText = [];
    for (const indexText in texts) {
      const nameInPortuguese = texts[indexText];
      const confidence = workingItems[indexText].Confidence;
      finalText.push(` ${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`)
    }
    return finalText;
  }
  async getImageBuffers(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" })
    const buffer = Buffer.from(response.data, "base64");
    return buffer;
  }
  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;
      const buffer = await this.getImageBuffers(imageUrl)
      const { names, workingItems } = await this.detectImageLabels(buffer)
      const text = await this.translateText(names);
      const finalText = this.formatTextResults(text.split(" e "), workingItems);
      console.log(finalText);
      return {
        statusCode: 200,
        body: `A imagem tem `.concat(finalText),
      }
    } catch (error) {
      console.error("Error**", error.stack)
      return { statusCode: 500, body: "internal server error" }
    }
  }
}
const AWS = require("aws-sdk");
const reko = new AWS.Rekognition()
const translator = new AWS.Translate()
const handler = new Handler({ rekoSvc: reko, translatorSvc: translator })


module.exports.main = handler.main.bind(handler)