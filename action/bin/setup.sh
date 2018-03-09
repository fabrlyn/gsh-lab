#!/bin/bash

. ../config.env
aws s3 mb s3://$GSH_ACTION_BUCKET_NAME --region $GSH_ACTION_REGION --profile $GSH_ACTION_PROFILE
