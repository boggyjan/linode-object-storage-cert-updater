// Log reporter
import axios from 'axios'
import config from './updater.config.js'

async function report (text) {
  // telegram bot token
  const botToken = config.telegramBotToken
  // my telegram ID
  const myID = config.myTelegramId
  // telegram api url
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  if (botToken && botToken !== '1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ' && myID && myID !== '123456789') {
    try {
      const msg = {
        chat_id: myID,
        text
      }

      await axios.post(url, msg)
    } catch (err) {
      // console.log('Telegram Error', err)
      console.log('Telegram Error')
    }
  }
}

export default { report }
