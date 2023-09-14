import fs from 'fs'
import axios from 'axios'
import { CronJob } from 'cron'
import config from './updater.config.js'

function updater () {
  const certs = config.certs

  if (!certs || !certs.length) {
    console.log('[Failed] No certs settings in env vars')
    return
  }

  certs.forEach(async cert => {
    // DELETE CERT
    // curl -H "Authorization: Bearer $TOKEN" \
    //     -X DELETE \
    //     https://api.linode.com/v4/object-storage/buckets/us-east-1/example-bucket/ssl
    try {
      await axios.delete(
        `https://api.linode.com/v4/object-storage/buckets/${cert.region}/${cert.bucket}/ssl`,
        { headers: { authorization: `Bearer ${config.apiToken}` }}
      )
      console.log(`[Success] ${cert.bucket} cert removed`)
    } catch (err) {
      console.log(`[Failed] ${cert.bucket} cert remove failed`, err)
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
      const certificate = fs.readFileSync(cert.certPath + '/cert.pem', 'utf8')
      const private_key = fs.readFileSync(cert.certPath + '/privkey.pem', 'utf8')

      await axios.post(
        `https://api.linode.com/v4/object-storage/buckets/${cert.region}/${cert.bucket}/ssl`,
        { certificate, private_key },
        { headers: { authorization: `Bearer ${config.apiToken}` }}
      )
      console.log(`[Success] ${cert.bucket} cert updated`)
    } catch (err) {
      console.log(`[Failed] ${cert.bucket} cert update failed`, err)
    }
  })
}

function initCronJob () {
  if (!config.cron) {
    console.log('[Failed] No cron settings in env vars')
    return
  }

  const job = new CronJob(config.cron, updater)
  job.start()
  console.log('[Success] CronJob started')
}

// init cron job
// initCronJob()

updater()
