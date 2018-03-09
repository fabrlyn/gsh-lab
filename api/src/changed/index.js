const AWS = require('aws-sdk')
const Protobuf = require('protobufjs')

const { TABLE_NAME, AWS_REGION } = process.env

AWS.config.update({ region: AWS_REGION });

const handleErr = (callback, err) => {
  console.log('err:', err)
  callback(err)
}

const getPayload = dataBuffer => root => {
  const Payload = root.lookupType("messages.RequestPayload");
  const message = Payload.decode(dataBuffer);
  const payload = Payload.toObject(message)

  return { Payload, payload } 
}

const savePower = (db, table, id, payload) => 
  db
    .update({
       TableName: table,
       Key: { id },
       UpdateExpression: 'set #state.power = :power',
       ExpressionAttributeNames: {'#state' : 'state'},
       ExpressionAttributeValues: { ':power': payload.power },
       ReturnValues: 'UPDATED_NEW'
     })
    .promise()

const saveBrightness = (db, table, id, payload) => 
  db
    .update({
       TableName: table,
       Key: { id },
       UpdateExpression: 'set #state.brightness = :brightness',
       ExpressionAttributeNames: {'#state' : 'state'},
       ExpressionAttributeValues: { ':brightness': payload.brightness },
       ReturnValues: 'UPDATED_NEW'
     })
    .promise()

const saveTemperature = (db, table, id, payload) => 
  db
    .update({
       TableName: table,
       Key: { id },
       UpdateExpression: 'set #state.temperature = :temperature',
       ExpressionAttributeNames: {'#state' : 'state'},
       ExpressionAttributeValues: { ':temperature': payload.temperature},
       ReturnValues: 'UPDATED_NEW'
     })
    .promise()

const saveColor = (db, table, id, payload) => 
  db
    .update({
       TableName: table,
       Key: { id },
       UpdateExpression: 'set #state.colorR = :r, #state.colorG = :g, #state.colorB = :b',
       ExpressionAttributeNames: {'#state' : 'state'},
       ExpressionAttributeValues: { 
         ':r': payload.colorRed, 
         ':g': payload.colorGreen, 
         ':b': payload.colorBlue 
       },
       ReturnValues: 'UPDATED_NEW'
     })
    .promise()

const save = (db, table, id) => ({ Payload, payload }) => {
    switch(payload.type) {
      case Payload.Type.Power:
        return savePower(db, table, id, payload)
        break
      case Payload.Type.Brightness:
        return saveBrightness(db, table, id, payload)
      case Payload.Type.Color:
        return saveColor(db, table, id, payload)
      case Payload.Type.Temperature:
        return saveTemperature(db, table, id, payload)
      default:
       throw Error('dont know how to handle: ' + JSON.stringify(payload))
    }
}

exports.handler = (event, context, callback) => {
  console.log('event:', event)
  const db = new AWS.DynamoDB.DocumentClient()

  const [ _, __, deviceId = '' ] = event.topic.split('/')
  const dataBuffer = Buffer.from(event.data, 'base64')

  if (deviceId === '') {
    return handleErr(callback, 'failed to extract deviceId')
  }

  Protobuf
    .load("payload.proto")
    .then(getPayload(dataBuffer))
    .then(save(db, TABLE_NAME, deviceId))
    .catch(err => handleErr(callback, err))
}
