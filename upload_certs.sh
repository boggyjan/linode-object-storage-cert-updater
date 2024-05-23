#!/bin/bash

echo "-------------- Upload Certs Begin ---------------"
echo "Start upload certs by node.js"
node /var/www/linode-object-storage-cert-updater/upload_certs.js $1

echo "-------------- Upload Certs End ----------------"
