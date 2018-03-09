. ../config.env

aws s3 rb s3://$GSH_ACTION_BUCKET_NAME \
  --region $GSH_ACTION_REGION \
  --profile $GSH_ACTION_PROFILE \
  --force

aws cloudformation delete-stack \
  --stack-name $GSH_ACTION_STACK_NAME \
  --region $GSH_ACTION_REGION \
  --profile $GSH_ACTION_PROFILE
