#!/bin/bash

echo "-------------- Upload Challenge Begin ---------------"
echo "$CERTBOT_DOMAIN:" $CERTBOT_DOMAIN
echo "$CERTBOT_VALIDATION:" $CERTBOT_VALIDATION
echo "Start upload by node.js"
node /var/www/linode-object-storage-cert-updater/challenge_upload.js $CERTBOT_DOMAIN $CERTBOT_VALIDATION

echo "-------------- Upload Challenge End ----------------"
