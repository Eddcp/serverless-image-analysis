'use strict';
const aws = require('aws-sdk');
const reko = new aws.Rekognition()

class Handler {
  constructor({ rekoSvc }) {
    this.rekoSvc = rekoSvc
  }

  async main(event) {
    try {
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

//factory
const handler = new Handler({
  rekoSvc: reko
});

module.exports.main = handler.main.bind();
