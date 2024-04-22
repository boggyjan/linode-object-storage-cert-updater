import fs from 'fs'
import axios from 'axios'
import { Upload } from '@aws-sdk/lib-storage'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import config from './updater.config.js'
import report from './telegramReporter.js'

const domain = process.argv[2]
const validation = process.argv[3]

report(`[Linode Object Storage Cert Updater] Start to remove challenge for ${domain}`)

const bucket = config.certs.find(cert => cert.bucket === domain)

// 找不到對應的bucket就退出
if (!bucket) {
  report(`[Linode Object Storage Cert Updater] no bucket found`)
  process.exit()
}

const client = new S3Client({
  credentials: {
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey
  },
  region: bucket.region,
  endpoint: `https://${bucket.region}.linodeobjects.com`,
  sslEnabled: true,
  s3ForcePathStyle: false
})

const filename = validation.replace(/\..+/, '')

console.log('filename:', filename)

const input = {
  Bucket: domain,
  Key: `.well-known/acme-challenge/${filename}`
}
const command = new DeleteObjectCommand(input)

try {
  const response = await client.send(command)
  report('[Linode Object Storage Cert Updater] challenge removed')
} catch {
  report(`[Linode Object Storage Cert Updater] remove challenge failed.`)
}

// Update bucket certs
report(`[Linode Object Storage Cert Updater] Start to remove old cert of ${domain}`)

// DELETE CERT
// curl -H "Authorization: Bearer $TOKEN" \
//     -X DELETE \
//     https://api.linode.com/v4/object-storage/buckets/us-east-1/example-bucket/ssl
try {
  await axios.delete(
    `https://api.linode.com/v4/object-storage/buckets/${bucket.region}/${bucket.bucket}/ssl`,
    { headers: { authorization: `Bearer ${config.apiToken}` }}
  )
  report(`[Linode Object Storage Cert Updater] old cert of ${domain} removed`)
  console.log(`[Success] ${bucket.bucket} cert removed`)
} catch (err) {
  report(`[Linode Object Storage Cert Updater] remov old cert of ${domain} failed`)
  console.log(`[Failed] ${bucket.bucket} cert remove failed`, err)
}

report(`[Linode Object Storage Cert Updater] Start to upload new cert of ${domain}`)
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

  report(`[Linode Object Storage Cert Updater] New cert of ${domain} begins with: ${certificate.slice(0, 250)}`)

  await axios.post(
    `https://api.linode.com/v4/object-storage/buckets/${bucket.region}/${bucket.bucket}/ssl`,
    { certificate, private_key },
    { headers: { authorization: `Bearer ${config.apiToken}` }}
  )
  report(`[Linode Object Storage Cert Updater] new cert of ${domain} uploaded`)
  console.log(`[Success] ${bucket.bucket} cert uploaded`)
} catch (err) {
  report(`[Linode Object Storage Cert Updater] upload new cert of ${domain} failed`)
  console.log(`[Failed] ${bucket.bucket} cert upload failed`, err)
}
