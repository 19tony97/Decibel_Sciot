const { Telegraf } = require('telegraf')
const amqp = require('amqplib')
const moment = require('moment')
require('dotenv').config()

const bot = new Telegraf(`${process.env.BOT_TOKEN}`)
var chatId

// * Client riceve un messaggio dalla coda
connectAndWait()

// * Start del bot
bot.start((ctx) => {
  chatId = ctx.update.message.chat.id
  ctx
    .reply(`Hi ${ctx.update.message.chat.first_name}, I am DeciBot! Nice to meet you!\n\nI’ll warn you when the decibel of the machines in the industry will overcome the ear's limit decibel. 🔊👂`)
    .then(() => {
      ctx.reply(`⚠️ Don't stop this bot if you want to be warned when the decibel limits are passed. ⚠️\n`)
    })
})

// * Callback function
bot.action('PPE_true', (ctx) => {
  sendMessage('Your ears are safe, keep working!')
  ctx.deleteMessage()
  var str = '🤖 Don’t worry using the PPE the decibel s limit of your ears is not reached you can continue to work safely.\n\nDate: ' + moment().format('MMMM Do YYYY, h:mm:ss a')

  ctx.reply(str)
})

// * Callback function
bot.action('PPE_false', (ctx) => {
  sendMessage('⚠️ Stop working ⚠️ You must wear PPE! permanent noise without PPE damages not only hearing but also the general state of health, the ability to concentrate, the psyche and other organs.')
  ctx.deleteMessage()
  var str = "I sent an alert to the machinery manager.\n\nDate: " + moment().format('MMMM Do YYYY, h:mm:ss a')

  ctx.reply(str)
})

bot.launch()

// * Aspetto connessioni
function connectAndWait() {
  amqp
    .connect(`amqp://guest:guest@${process.env.MY_IP}:5672`)
    .then(function (conn) {
      return conn.createChannel().then(function (ch) {
        var ok = ch.assertQueue('iot/alerts', { durable: false })

        ok = ok.then(function (_qok) {
          return ch.consume(
            'iot/alerts',
            function (msg) { waitForMessage(msg) },
            { noAck: true }
          )
        })

        return ok.then(function (_consumeOk) {
          console.log(' *** Telegram Bot Started! ***')
        })
      })
    })
    .catch(console.warn)
}

// * Aspetto messaggi
function waitForMessage(msg) {
  console.log('Decibel: ' + msg.content.toString())
  // * Opzioni per callback
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'YES, I am using PPE',
            callback_data: 'PPE_true',
          },
        ],
        [
          {
            text: 'No, I am not using PPE',
            callback_data: 'PPE_false',
          },
        ],
      ],
    },
  }

  // Messaggio al bot
  bot.telegram.sendMessage(
    chatId,
    `🚨 Hey! The decibel endurance limit is exceeded! 🚨 Actually is ${msg.content.toString()}dBA ⚠️! Are you using PPE (Personal Protective Equipment)? 🎧🧤🥽⛑️`,
    options
  )
}

// * Loggo i messaggi di risposta
function sendMessage(msg) {
  var queue = 'iot/logs'
  amqp
    .connect(`amqp://guest:guest@${process.env.MY_IP}:5672`)
    .then(function (conn) {
      return conn
        .createChannel()
        .then(function (channel) {
          var ok = channel.assertQueue(queue, { durable: false })
          return ok.then(function (_qok) {
            channel.sendToQueue(queue, Buffer.from(msg))
            console.log('- ' + msg + '\n')
            return channel.close()
          })
        })
        .finally(function () {
          conn.close()
        })
    })
    .catch(console.warn)
}
