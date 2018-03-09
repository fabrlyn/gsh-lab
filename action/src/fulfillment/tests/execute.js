const lambdaLocal = require('lambda-local')
const path = require('path')
const request = require('./events/execute')

lambdaLocal
  .execute({
    event: request,
    lambdaPath: path.join(__dirname, '../index.js') ,
    timeoutMs: 3000,
    environment: {
      DEVICE_ENDPOINT: 'https://ptajrg0yfk.execute-api.eu-west-1.amazonaws.com/Prod',
      PROJECT_ID: 'projectid',
      SECRET: 'supersecret',
      CLIENT_ID: 'clientid'
    },
    callback: () => {}
  })



