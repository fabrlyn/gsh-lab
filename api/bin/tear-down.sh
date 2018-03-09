. ../config.env

aws s3 rb s3://gsh-deploy-bucket-$GSH_API_NAMESPACE --region eu-west-1 --force
aws cloudformation delete-stack --stack-name gsh-stack-$GSH_API_NAMESPACE
