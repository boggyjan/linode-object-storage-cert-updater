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

