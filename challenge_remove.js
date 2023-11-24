import fs from 'fs'
import axios from 'axios'
import { Upload } from '@aws-sdk/lib-storage'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import config from './updater.config.js'

const domain = process.argv[2]
const validation = process.argv[3]

const bucket = config.certs.find(cert => cert.bucket === domain)

// 找不到對應的bucket就退出
if (!bucket) {
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
const response = await client.send(command)

// Update bucket certs

// DELETE CERT
// curl -H "Authorization: Bearer $TOKEN" \
//     -X DELETE \
//     https://api.linode.com/v4/object-storage/buckets/us-east-1/example-bucket/ssl
try {
  await axios.delete(
    `https://api.linode.com/v4/object-storage/buckets/${bucket.region}/${bucket.bucket}/ssl`,
    { headers: { authorization: `Bearer ${config.apiToken}` }}
  )
  console.log(`[Success] ${bucket.bucket} cert removed`)
} catch (err) {
  console.log(`[Failed] ${bucket.bucket} cert remove failed`, err)
}

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

  await axios.post(
    `https://api.linode.com/v4/object-storage/buckets/${bucket.region}/${bucket.bucket}/ssl`,
    { certificate, private_key },
    { headers: { authorization: `Bearer ${config.apiToken}` }}
  )
  console.log(`[Success] ${bucket.bucket} cert updated`)
} catch (err) {
  console.log(`[Failed] ${bucket.bucket} cert update failed`, err)
}
