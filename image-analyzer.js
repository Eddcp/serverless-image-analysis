const { promises : { readFile }} = require('fs');
const { get } = require('axios');

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

    return { labelNames, confidenceGreaterThan80Items} ;
  }

  
  splitNames(names) {
    return names.split(' and ');
  }

  formatTextResults(names, confidenceGreaterThan80Items) {
    const finalText = [];
    for(const index in names) {
      const namesOfImages = names[index];
      const confidence = confidenceGreaterThan80Items[index].Confidence;
      finalText.push(
        `${confidence.toFixed(2)}% of being ${namesOfImages}`
      )
    }
    return finalText.join('\n');
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, {
      responseType: 'arraybuffer'
    });
    console.log(response.data);
    const buffer = Buffer.from(response.data, 'base64');
    return buffer;
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters;
      console.log('Downloading image...');
      const imgBuffer = await this.getImageBuffer(imageUrl);

      console.log('Detecting labels...');
      const {labelNames, confidenceGreaterThan80Items} = await this.detectImageLabels(imgBuffer);

      const finalText = this.formatTextResults(this.splitNames(labelNames), confidenceGreaterThan80Items);
      console.log('Finishing...');
      return {
        statusCode: 200,
        body: `The image has\ `.concat(finalText)
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