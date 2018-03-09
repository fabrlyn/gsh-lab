BASE=$PWD/..
. ../config.env

echo $GSH_API_NAMESPACE

cd $BASE/src/device && npm install
cd $BASE/src/devices && npm install
cd $BASE/src/power && npm install
cd $BASE/src/brightness && npm install
cd $BASE/src/color && npm install
cd $BASE/src/changed && npm install

cd $BASE/template && aws cloudformation package \
   --template-file input.yml \
   --output-template-file output.yaml \
   --s3-bucket gsh-deploy-bucket-$GSH_API_NAMESPACE

cd $BASE/template && aws cloudformation deploy \
  --parameter-overrides \
    Namespace=$GSH_API_NAMESPACE \
    IotEndpoint=$GSH_IOT_ENDPOINT \
    Simulation=$GSH_SIMULATION \
  --template-file output.yaml \
  --stack-name gsh-stack-$GSH_API_NAMESPACE \
  --capabilities CAPABILITY_IAM \
  --region $GSH_API_REGION


