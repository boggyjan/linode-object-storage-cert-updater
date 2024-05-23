import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import config from './updater.config.js'
import report from './telegramReporter.js'

const domain = process.argv[2]
const validation = process.argv[3]

await report(`[Linode Object Storage Cert Updater] Start to remove challenge for ${domain}`)

const bucket = config.certs.find(cert => cert.bucket === domain)

// 找不到對應的bucket就退出
if (!bucket) {
  await report(`[Linode Object Storage Cert Updater] no bucket found`)
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
  await report('[Linode Object Storage Cert Updater] challenge removed')
} catch {
  await report(`[Linode Object Storage Cert Updater] remove challenge failed.`)
}
