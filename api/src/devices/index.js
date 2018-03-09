const AWS = require('aws-sdk')
const { TABLE_NAME, AWS_REGION } = process.env

AWS.config.update({region: AWS_REGION});

exports.handler = (event, context, callback) => {
  new AWS.DynamoDB.DocumentClient()
    .scan({TableName: TABLE_NAME})
    .promise()
    .then(data => callback(null, {body: JSON.stringify(data.Items)}))
    .catch(err => callback(err))
}

