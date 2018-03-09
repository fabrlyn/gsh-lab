const AWS = require('aws-sdk')
const { TABLE_NAME, AWS_REGION } = process.env

AWS.config.update({ region: AWS_REGION });

exports.handler = (event, context, callback) => {
  const { id = '' } = event.pathParameters

  new AWS.DynamoDB.DocumentClient()
    .get({ TableName: TABLE_NAME, Key: { id } })
    .promise()
    .then(data => callback(null, { body: JSON.stringify(data.Item) }))
    .catch(err => callback(err))
}

