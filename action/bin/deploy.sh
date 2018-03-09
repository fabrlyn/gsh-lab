BASE=$PWD/..
. ../config.env

cd $BASE/src/auth && npm install
cd $BASE/src/fulfillment && npm install

cd $BASE/template && aws cloudformation package \
   --template-file input.yml \
   --output-template-file output.yaml \
   --s3-bucket $GSH_ACTION_BUCKET_NAME \
   --region $GSH_ACTION_REGION

cd $BASE/template && aws cloudformation deploy \
  --parameter-overrides \
    ClientId=$GSH_ACTION_CLIENT_ID \
    Secret=$GSH_ACTION_SECRET \
    DeviceEndpoint=$GSH_ACTION_API_ENDPOINT \
    ProjectId=$GSH_ACTION_PROJECT_ID \
  --template-file output.yaml \
  --stack-name $GSH_ACTION_STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --region $GSH_ACTION_REGION \
  --profile $GSH_ACTION_PROFILE
  

