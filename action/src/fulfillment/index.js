const { SECRET, DEVICE_ENDPOINT } = process.env

exports.handler = (event, context, callback) => {
  console.log('event:', JSON.stringify(event))

  if (`Bearer ${SECRET}` !== event.headers.Authorization) {
    return callback('not authorized')
  }

  const body = JSON.stringify(event.body)
  const response = { 
    requestId: body.requestId, 
    payload: { 
      devices: [] 
    }
  }

  callback(null, { body: JSON.stringify(response) })
}
