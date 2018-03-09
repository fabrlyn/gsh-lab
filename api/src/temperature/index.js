const AWS = require('aws-sdk')
const Protobuf = require('protobufjs')

const validateRequest = ({ value = -1 } = {}) => value >= 0

const validateDeviceId = (id = '') => id.length > 0

const handleOK = (callback, result) => {
  console.log('res:', result)
  callback(null, { statusCode: 200, body: JSON.stringify(result) })
}

const handleBadRequest = (callback) => {
  console.log('badRequest')
  callback(null, { statusCode: 400 })
}

const handleErr = (callback, err) => {
  console.log('err:', err)
  callback(null, { statusCode: 500 })
}

const buildTopic = (namespace, id, simulation) => {
  return simulation 
    ? `${namespace}/gsh/${id}/changed`
    : `${namespace}/gsh/${id}/control`
}

const validateItemAction = 
  action => 
    ({ Item }) => {
      if (!Item.actions.includes(action)) {
        throw Error('not supported action')
      }
      return Item
    }

const buildPayload = ({ value }) => root => {
  const Payload = root.lookupType("messages.RequestPayload")
  const payload = { temperature: value, type: Payload.Type.Temperature}
  const err = Payload.verify(payload)

  if (err) {
    throw Error(err)
  }
  return Promise.all([Payload, payload])
}

const payloadToBuffer = ([Payload, payload]) => {
  const message = Payload.create(payload)
  return Payload.encode(message).finish()
}

const publish = (client, namespace, id, simulation) => 
  payload => 
    client
      .publish({ 
        topic: buildTopic(namespace, id, simulation),
        payload: payload, 
        qos: 1
      })
      .promise()

const { 
  NAMESPACE, 
  SIMULATION, 
  TABLE_NAME, 
  IOT_ENDPOINT, 
  AWS_REGION 
} = process.env

const IsSimulation = SIMULATION === 'y'

AWS.config.update({ region: AWS_REGION });

exports.handler = (event, context, callback) => {
  const db = new AWS.DynamoDB.DocumentClient();
  const iotClient = new AWS.IotData({ endpoint: IOT_ENDPOINT })

  const request = JSON.parse(event.body)
  const deviceId = event.pathParameters.id

  const valid = [
    validateRequest(request), 
    validateDeviceId(deviceId)
  ].reduce((acc, res) => acc && res, true)

  if (!valid) {
    return handleBadRequest(callback)
  }

  return db
    .get({ TableName: TABLE_NAME, Key: { id: deviceId }})
    .promise()
    .then(validateItemAction('temperature'))
    .then(() => Protobuf.load("payload.proto"))
    .then(buildPayload(request))
    .then(payloadToBuffer)
    .then(publish(iotClient, NAMESPACE, deviceId, IsSimulation))
    .then((res) => handleOK(callback, request))
    .catch(err => handleErr(callback, err))
}
