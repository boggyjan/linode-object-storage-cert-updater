#!/bin/bash

echo "-------------- Remove Challenge Begin ---------------"
echo "$CERTBOT_DOMAIN:" $CERTBOT_DOMAIN
echo "$CERTBOT_VALIDATION:" $CERTBOT_VALIDATION
echo "Start remove challenge by node.js"
node /var/www/linode-object-storage-cert-updater/challenge_remove.js $CERTBOT_DOMAIN $CERTBOT_VALIDATION

echo "-------------- Remove Challenge End ----------------"
