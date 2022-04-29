/*
As said on jest docs
CAUTION
Since calls to jest.mock() are hoisted to the top of the file, Jest prevents access to out-of-scope variables. 
By default, you cannot first define a variable and then use it in the factory. Jest will disable this check for variables that start with the word mock. 
However, it is still up to you to guarantee that they will be initialized on time. Be aware of Temporal Dead Zone.
*/
const { allLabels, labelsUnder80PercentConfidence } = require('../utils/config-test');
const mockRekognitionInstance = {
	detectLabels: jest.fn().mockReturnThis(),
	promise: jest.fn().mockResolvedValue(allLabels)
}

const handler = require('../handler');
const AWS = require('aws-sdk');
const axios = require('axios');
const ImageAnalyzerHandler = require('../image-analyzer.js');

jest.mock('axios');

jest.mock('aws-sdk', () => ({
	Rekognition: jest.fn(() => mockRekognitionInstance)
}));

describe('image-analysis tests', () => {

	beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })
	
	it('should read imageBuffer and return animals and confidence greater than 80 percent', async () => {
		const buffer = Buffer.from("4sfkla");
		const base64ConvertedImg = Buffer.from(buffer, 'base64');

		axios.get.mockResolvedValue({
				data:buffer
		});
		const rekognition = new AWS.Rekognition();
		const event = {
			queryStringParameters: {
				imageUrl: "https://image.test.com"
			}
		};

		const imageAnalyzerHandler = new ImageAnalyzerHandler({
			rekoSvc: rekognition
		})
		const result = await handler.main(event, imageAnalyzerHandler);
	
		expect(axios.get).toHaveBeenCalledTimes(1);
		expect(AWS.Rekognition).toHaveBeenCalledTimes(1);
		expect(await rekognition.detectLabels().promise).toHaveBeenCalledTimes(1);
		expect(mockRekognitionInstance.detectLabels).toHaveBeenCalledWith(expect.objectContaining({
			Image: {
        Bytes:base64ConvertedImg
			}
    }));

		expect(result.statusCode).toBe(200);

	});

	it('should read imageBuffer and return animals and confidence greater than 80 percent', async () => {
		const buffer = Buffer.from("4sfkla");
		const base64ConvertedImg = Buffer.from(buffer, 'base64');

		const err = new Error('test error');

		axios.get.mockRejectedValueOnce(err);
		const rekognition = new AWS.Rekognition();
		const event = {
			queryStringParameters: {
				imageUrl: "https://image.test.com"
			}
		};

		const imageAnalyzerHandler = new ImageAnalyzerHandler({
			rekoSvc: rekognition
		})
		const result = await handler.main(event, imageAnalyzerHandler);
	
		expect(axios.get).toHaveBeenCalledTimes(1);
		expect(AWS.Rekognition).toHaveBeenCalledTimes(1);
		expect(await rekognition.detectLabels().promise).toHaveBeenCalledTimes(0);

		expect(result.statusCode).toBe(500);

	});
});


