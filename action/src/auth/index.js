const AWS = require('aws-sdk')
const request = require('request')

const { PROJECT_ID, SECRET, CLIENT_ID } = process.env
const RedirectUri = 'https://oauth-redirect.googleusercontent.com/r/' + PROJECT_ID

const validRequestType = requestType => requestType === 'token'
const validRedirectUri = uri => uri === RedirectUri 
const validClientId = clientId => clientId === CLIENT_ID

const extractRequest = event => {
  const query = event['queryStringParameters']

  const responseType = query['response_type']
  const redirectUri = query['redirect_uri']
  const state = query['state']
  const clientId = query['client_id']

  return {
    responseType,
    redirectUri,
    state,
    clientId,
  }
}

const buildRedirectUrl = (redirectUri, token, state) => 
  `${redirectUri}#access_token=${token}&token_type=bearer&state=${state}`

exports.handler = (event, context, callback) => {
  console.log('event:', event)

  const { 
    responseType, 
    redirectUri, 
    clientId, 
    state 
  } = extractRequest(event)

  const validRequest = [
    validRequestType(responseType),
    validRedirectUri(redirectUri),
    validClientId(clientId),
  ].reduce((acc, valid) => acc && valid)

  if (!validRequest) {
    return callback('invalid request')
  }

  const url = buildRedirectUrl(RedirectUri, SECRET, state)

  console.log('redirect url:', url)
  callback(null, { statusCode: 301, headers: { Location: url }, body:'' })
}
