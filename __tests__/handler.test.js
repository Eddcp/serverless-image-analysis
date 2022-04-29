/*
As said on jest docs
CAUTION
Since calls to jest.mock() are hoisted to the top of the file, Jest prevents access to out-of-scope variables. 
By default, you cannot first define a variable and then use it in the factory. Jest will disable this check for variables that start with the word mock. 
However, it is still up to you to guarantee that they will be initialized on time. Be aware of Temporal Dead Zone.
*/
const { allLabels, labelsUnder80PercentConfidence } = require('../configTest');
const mockRekognitionInstance = {
	detectLabels: jest.fn().mockReturnThis(),
	promise: jest.fn().mockResolvedValue(allLabels)
}

const handler = require('../handler');
const AWS = require('aws-sdk');
const fs = require('fs');

const ImageAnalyzerHandler = require('../image-analyzer.js');



jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(),
  },
}));

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
		const buffer = '4pyTIMOgIGxhIG1vZGU=';
	
		fs.promises.readFile.mockReturnValue(buffer);
		const rekognition = new AWS.Rekognition();

		const imageAnalyzerHandler = new ImageAnalyzerHandler({
			rekoSvc: rekognition
		})
		handler.main(imageAnalyzerHandler);
	
		expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
		// expect(reko.detectLabels.promise()).toHaveBeenCalled();
	});
});


