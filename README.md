# Installtion
- After you finish your first time certbot setting by manual method. You have to update the auto-renewal config at /etc/letsencrypt/renewal/xxx.conf.

- Add lines below after [renewalparams] block
server = https://acme-v02.api.letsencrypt.org/directory
manual_auth_hook = /var/www/linode-object-storage-cert-updater/challenge_upload.sh
manual_cleanup_hook = /var/www/linode-object-storage-cert-updater/challenge_remove.sh

- If you are using a different path, please use the currect path that you are using. (also in challenge_remove.sh and challenge_upload.sh)

- example
[renewalparams]
account = xxxxx
authenticator = manual
server = https://acme-v02.api.letsencrypt.org/directory
manual_auth_hook = /var/www/linode-object-storage-cert-updater/challenge_upload.sh
manual_cleanup_hook = /var/www/linode-object-storage-cert-updater/challenge_remove.sh

- npm i

- Please run pm2 in root permissions
```
sudo su root
pm2 start pm2.config.cjs
```