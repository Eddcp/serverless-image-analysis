'use strict';
const aws = require('aws-sdk');
const reko = new aws.Rekognition();
const { promises : { readFile }} = require('fs');

class Handler {
  constructor({ rekoSvc }) {
    this.rekoSvc = rekoSvc
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSvc.detectLabels({
      Image: {
        Bytes:buffer
      }
    }).promise();

    const workingItems = result.Labels
      .filter(({ Confidence }) => Confidence > 80);

    const animals = workingItems
      .map(({ Name }) => Name)
      .join(' and ');

    console.log({ animals, workingItems});
  }

  async main(event) {
    try {
      const imgBuffer = await readFile('./images/pandora.jpeg');
      await this.detectImageLabels(imgBuffer);
      return {
        statusCode: 200,
        body: 'Hello!'
      }
    } catch(error) {
      console.log('Error***', error.stack);
      return {
        statusCode: 500,
        body: 'Internal Server Error!'
      }
    }
  }
}

const handler = new Handler({
  rekoSvc: reko
});

module.exports.main = handler.main.bind(handler);
