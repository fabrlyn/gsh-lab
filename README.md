# google-smart-home

## Pre-requisites

- node
- aws-cli
- AWS account
- Google Assistant installed on a device

# Lab

The lab will go through how to set up the skeleton of the Smart Home Action and the Actions on Google configuration in Googles cloud console. The Smart Home Action is setup to be hosted on AWS as Node lambdas accessable via API Gateway.

## Project structure
```
api/
    config.env - Configure this file before running bin/ scripts
    bin/
        setup.sh - Run once
        deploy.sh - Run when you want to deploy
        tear-down.sh - Run when you had enough
    src/
    template/

action/
    config.env -> Configure this file before running bin/ scripts
    bin/
        setup.sh - Run once
        deploy.sh - Run when you want to deploy
        tear-down.sh - Run when you had enough
    src/
        auth/
        fulfillment/
            index.js - Implement your fulfillment in this file
        tests/ 
            events/ - contains simple test payloads to run your action locally
    template/
```

## Smart Home Action - Create

The first step will go through the process of creating the Smart Home Action in the Actions on Google console.

Go to the [console](https://console.actions.google.com)

Press `Add/import Project`, choose your project name and `Sweden` as country.

Press `Build` on the `Smart Home` card.

Find your project ID in the browser URL and save it for later. See URL example.
`https://console.actions.google.com/u/0/project/<this-is-your-project-id>/overview/smarthome`

## Smart Home Action - Setup & Deploy Smart Home Action

Next step is to setup and deploy our Smart Home Action on AWS.

Edit the environment variables in `action/config.env` to configure your Smart Home Action deployment.

Your config should look similar to this:
```sh
GSH_ACTION_BUCKET_NAME=<A_FAIRLY_UNIQUE_NAME>
GSH_ACTION_STACK_NAME=<A_FAIRLY_UNIQUE_NAME.
GSH_ACTION_PROJECT_ID=<INSERT_GOOGLE_ACTION_PROJECT_ID>
GSH_ACTION_PROFILE=<YOUR_AWS_CREDENTIALS_PROFILE>  #If unsure, check ~/.aws/credentials

GSH_ACTION_API_ENDPOINT=https://ptajrg0yfk.execute-api.eu-west-1.amazonaws.com/Prod #Leave as is
GSH_ACTION_SECRET=supersecret #Leave as is
GSH_ACTION_REGION=eu-west-1 #Leave as is
GSH_ACTION_CLIENT_ID=google-client-id #Leave as is
```

With the configuration values in place we are ready to create the S3 bucket which will hold our deployments.

If not already in the terminal, open your terminal.

Make sure you are in the same directory as the script, they work on relative paths - sorry.

Change directory into `action/bin`.

Run the `setup.sh` script.

After that we are ready to deploy our device API. 

Run the `deploy.sh`

Go to the AWS [console](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks?filter=active)

Press the stack containing the GSH_ACTION_STACK_NAME value you set in the configuration file earlier.

Expand the `Resource` tab on the stack detail view and find the row with `ServerlessRestApi`. Press the link and press the API containing the same name as the stack it self.

Press `Stages` in the left menu and press `Prod`.

The `Invoke URL` is your Smart Home Action's base URL. Save this for later.

## Config Actions On Google - Smart Home

Go to the google [console](https://console.actions.google.com) and select your newly created Smart Home Action project.

Press `Add Action`, `Build` on the `Smart Home` card and supply the fulfillment URL based on the base URL acquired from setting up your Action on AWS: Your-Action-Base-URL/fulfillment

Add more App information. Enter whatever and skip all that is optional.

Enter a some policy URL, not important for this demo.

Go back to Overview.

Edit the third step, Account linking.


```
Authorization mode: Implicit.

ClientID: google-client-id

Auth URL:Your-Action-Base-URL/auth
```

Skip scopes.

Enter some text in the testing instructions, this app will never make it to Draft submition.

Press `Test Draft` to activate your action.

## Google Home App

Go to the Google Home app on your phone and and press the "hamburger bar". Select `Home Control` and press the "+" button. You should now see you Smart Home Action in the list of services. Press you service to begin linking your account with your Action. If it goes through successfully you are ready to start building you action in the `action/src/fulfillment/index.js` file.

When you linked your account just now, Google made a Sync request to your fulfillment lambda. Go to the logs in AWS to check it out.

Go to the AWS [console](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks?filter=active)

Press the stack containing the GSH_ACTION_STACK_NAME value you set in the configuration file earlier.

Expand the `Resource` tab on the stack detail view and find the row with `LambdaFulfillment`. Press the link and then press the `Monitoring` tab in the lambda view. Press `Jump to Logs` to go and check out the logs.

## Start building your action

With everything set up, you can now start building your action.

Start by implementing the Sync intent and then move on to the Execute intent.

If you run `npm run test-sync` you will run your fulfillment lambda locally, this can help to test and try your implementation before deploying.

There are similar tests for query and execute, `npm run test-query` and `npm run test-execute`.

To re-deploy your solution just change directory to the `action/bin` and run the `deploy.sh` script as before.

If you want to edit the test event payloads used in the `npm run test-...` go to the `action/src/fulfillment/tests/events` directory and edit the file of interest.

The `GSH_ACTION_API_ENDPOINT` contains the Device API endpoint if you want to use it. A simple description of the API is further down in this document.


## Action Documentation

[Smart Home documentation](https://developers.google.com/actions/smarthome/)

[Fulfillment](https://developers.google.com/actions/smarthome/create-app#provide-fulfillment)

[Sync](https://developers.google.com/actions/smarthome/create-app#actiondevicessync)

[Execute](https://developers.google.com/actions/smarthome/create-app#actiondevicesexecute)

[Query](https://developers.google.com/actions/smarthome/create-app#actiondevicesquery)

[Traits](https://developers.google.com/actions/smarthome/traits/)

[Types](https://developers.google.com/actions/smarthome/guides/)

[Validator](https://developers.google.com/actions/smarthome/tools/validator/)

## Device API

  ### GET /device
  Get all devices
  ##### Response Body
  ```json
  [
      {
          "id": "5C:CF:7F:81:36:19",
          "model": "ard-0",
          "swVersion": "0.1",
          "manufacturer": "homeway",
          "hwVersion": "0.1",
          "friendlyNames": [
            "Light One"
          ],
          "name": "test device 1",
          "actions": [
            "power",
             "brightness",
             "color"
          ],
          "state": {
            "power": false,
            "brightness": 52,
            "temperature": 2700,
            "colorRed": 240,
            "colorGreen": 220,
            "colorBlue": 210 
          },
          "type": "LED or RELAY"
        }
  ]
  ```
---
  ### GET /device/{id}
  Get device
  ##### Response Body
  ```json
  {
      "id": "5C:CF:7F:81:36:19",
      "model": "ard-0",
      "swVersion": "0.1",
      "manufacturer": "homeway",
      "hwVersion": "0.1",
      "friendlyNames": [
        "Light One"
      ],
      "name": "test device 1",
      "actions": [
        "power",
         "brightness",
         "color"
      ],
      "state": {
        "power": false,
        "brightness": 52,
        "colorRed": 240,
        "colorGreen": 220,
        "colorBlue": 210 
      },
      "type": "LED or RELAY"
    }
  }
  ```
---
  ### POST /device/{id}/on-off
  Turn device `ON` or `OFF`
  ##### Request Body
  ```json
  {
      "value": true
  }
  ```
  ##### Response Body
  ```json
  {
      "value": true
  }
  ```
---
  ### POST /device/{id}/brightness
  Set brightness to `0-100`
  ##### Request Body
  ```json
  {
      "value": 52
  }
  ```
  ##### Response Body
  ```json
  {
      "value": 52
  }
  ```
---
  ### POST /device/{id}/color-spectrum
  Set color to `r: 0-255`, `g: 0-255`, `b: 0-255`
  ##### Request Body
  ```json
  {
      "value": {
          "r": 240,
          "g": 210,
          "b": 200
      }
  }
  ```
  ##### Response Body
  ```json
  {
      "value": {
          "r": 240,
          "g": 210,
          "b": 200
      }
  }
  ```
---


## Device API - Optional

We will host the Device API in AWS and setup/deploy it via CloudFormation. The process needs a few configuration values.

Edit the environment variables in `api/config.env` to configure your Device API deployment.

Run this command to find your IOT endpoint: `aws iot describe-endpoint --region eu-west-1
` 

Your config should look similar to this:
```sh
GSH_API_NAMESPACE=<SOMETHING_FAIRLY_UNIQUE>
GSH_IOT_ENDPOINT=<INSERT_YOUR_IOT_ENDPOINT>
GSH_API_PROFILE=<INSERT_YOUR_AWS_CONFIG_PROFILE>
GSH_API_REGION=eu-west-1 # Leave as is
GSH_SIMULATION=y # Leave as is
```

With the configuration values in place we are ready to create the S3 bucket which will hold our deployments. 

Change directory into `api/bin`. 

Run the `setup.sh` script.

After that we are ready to deploy our device API. 

Run the `deploy.sh`

With the device API up and running we populate our device API's database with some devices.

Run the `seed.sh`

Go to the AWS [console](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks?filter=active)

Press the stack containing the GSH_API_NAMESPACE value you set in the configuration file earlier.

Expand the `Resource` tab on the stack detail view and find the row with `ServerlessRestApi`. Press the link and press the API containing the same name as the stack it self.

Press `Stages` in the left menu and press `Prod`.

The `Invoke URL` is your device API's base URL. Save this for later.