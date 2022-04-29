const { promises : { readFile }} = require('fs');

class ImageAnalyzerHandler {
  constructor({ rekoSvc }) {
    this.rekoSvc = rekoSvc
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSvc.detectLabels({
      Image: {
        Bytes:buffer
      }
    }).promise();

    const confidenceGreaterThan80Items = result.Labels
      .filter(({ Confidence }) => Confidence > 80);

    const labelNames = confidenceGreaterThan80Items
      .map(({ Name }) => Name)
      .join(' and ');

    console.log({ labelNames, confidenceGreaterThan80Items});
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

module.exports = ImageAnalyzerHandler;