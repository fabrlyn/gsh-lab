const lambdaLocal = require('lambda-local')
const path = require('path')
const request = require('./events/execute')

lambdaLocal
  .execute({
    event: request,
    lambdaPath: path.join(__dirname, '../index.js') ,
    timeoutMs: 3000,
    environment: {
      PROJECT_ID: 'projectid',
      SECRET: 'supersecret',
      CLIENT_ID: 'clientid'
    },
    callback: () => {}
  })



