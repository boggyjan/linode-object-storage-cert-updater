# Installtion
- git clone git@github.com:boggyjan/linode-object-storage-cert-updater.git
- npm i
- After you finished your first time ssl setup by certbot "manual" method. You have to update the auto-renewal config at /etc/letsencrypt/renewal/xxx.conf. Add three lines below after [renewalparams] block:
```
server = https://acme-v02.api.letsencrypt.org/directory
manual_auth_hook = /var/www/linode-object-storage-cert-updater/challenge_upload.sh
manual_cleanup_hook = /var/www/linode-object-storage-cert-updater/challenge_remove.sh
```
- If you are using a different path of the cert-updater, please replace the path to the path that you are using. (also in challenge_remove.sh and challenge_upload.sh)
- example:
```
[renewalparams]
account = xxxxx
authenticator = manual
server = https://acme-v02.api.letsencrypt.org/directory
manual_auth_hook = /path/to/cert-updater/challenge_upload.sh
manual_cleanup_hook = /path/to/cert-updater/challenge_remove.sh
```
- *.sh example
```
node /path/to/cert-updater/challenge_upload.js $CERTBOT_DOMAIN $CERTBOT_VALIDATION
```