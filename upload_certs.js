import fs from 'fs'
import axios from 'axios'
import config from './updater.config.js'
import report from './telegramReporter.js'

const domain = process.argv[2]

const bucket = config.certs.find(cert => cert.bucket === domain)

// 找不到對應的bucket就退出
if (!bucket) {
  await report(`[Linode Object Storage Cert Updater] no bucket found`)
  process.exit()
}

// Update bucket certs
await report(`[Linode Object Storage Cert Updater] Start to remove old cert of ${domain}`)

// DELETE CERT
// curl -H "Authorization: Bearer $TOKEN" \
//     -X DELETE \
//     https://api.linode.com/v4/object-storage/buckets/us-east-1/example-bucket/ssl
try {
  await axios.delete(
    `https://api.linode.com/v4/object-storage/buckets/${bucket.region}/${bucket.bucket}/ssl`,
    { headers: { authorization: `Bearer ${config.apiToken}` }}
  )
  await report(`[Linode Object Storage Cert Updater] old cert of ${domain} removed`)
  console.log(`[Success] ${bucket.bucket} cert removed`)
} catch (err) {
  await report(`[Linode Object Storage Cert Updater] remov old cert of ${domain} failed`)
  console.log(`[Failed] ${bucket.bucket} cert remove failed`, err)
}

await report(`[Linode Object Storage Cert Updater] Start to upload new cert of ${domain}`)
// UPLOAD CERT
// curl -H "Content-Type: application/json" \
//     -H "Authorization: Bearer $TOKEN" \
//     -X POST -d '{
//         "certificate": "-----BEGIN CERTIFICATE-----\nCERTIFICATE_INFORMATION\n-----END CERTIFICATE-----",
//         "private_key": "-----BEGIN PRIVATE KEY-----\nPRIVATE_KEY_INFORMATION\n-----END PRIVATE KEY-----"
//       }' \
//     https://api.linode.com/v4/object-storage/buckets/us-east-1/example-bucket/ssl
try {
  const certificate = fs.readFileSync(bucket.certPath + '/fullchain.pem', 'utf8')
  const private_key = fs.readFileSync(bucket.certPath + '/privkey.pem', 'utf8')

  await report(`[Linode Object Storage Cert Updater] New cert of ${domain} begins with: ${certificate.slice(0, 250)}`)

  await axios.post(
    `https://api.linode.com/v4/object-storage/buckets/${bucket.region}/${bucket.bucket}/ssl`,
    { certificate, private_key },
    { headers: { authorization: `Bearer ${config.apiToken}` }}
  )
  await report(`[Linode Object Storage Cert Updater] new cert of ${domain} uploaded`)
  console.log(`[Success] ${bucket.bucket} cert uploaded`)
} catch (err) {
  await report(`[Linode Object Storage Cert Updater] upload new cert of ${domain} failed`)
  console.log(`[Failed] ${bucket.bucket} cert upload failed`, err)
}
