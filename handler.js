'use strict';
const aws = require('aws-sdk');
const reko = new aws.Rekognition();
const ImageAnalyzerHandler = require('./image-analyzer.js');

const imageAnalyzerHandler = new ImageAnalyzerHandler({
  rekoSvc: reko
});

module.exports = {
  main: imageAnalyzerHandler.main.bind(imageAnalyzerHandler),
}
