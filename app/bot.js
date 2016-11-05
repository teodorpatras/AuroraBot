'use strict'

const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {polling: true})

const flickrHandler = require('./flickrHandler')
const ForecastHandler = require('./forecastHandler')
const forecastHandler = new ForecastHandler(onKpAlert)

const PHOTO_COMMAND = 'Photo of the Aurora Borealis.'
const VISIBILITY_COMMAND = 'Current visibility of the Aurora.'
const SCHEDULE_ALERT_COMMAND = 'Schedule visibility alert.'
const CANCEL_ALERT_COMMAND = 'Unschedule from any alerts.'
const KP_PHOTO = 'http://www.aurora-service.eu/wp-content/uploads/2013/08/kp-map.png'

const options = {
    "parse_mode": "Markdown",
    "reply_markup": JSON.stringify({
        "keyboard": [
            [{text: PHOTO_COMMAND}],
            [{text: VISIBILITY_COMMAND}],
            [{text: SCHEDULE_ALERT_COMMAND}],
            [{text: CANCEL_ALERT_COMMAND}]
        ],
        "one_time_keyboard": true
    })
}

const kpOptions = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{ text: "1" },
            { text: "2" },
            { text: "3" },
            { text: "4" },
            { text: "5" },
            { text: "6" },
            { text: "7" },
            { text: "8" }
            ]
        ]
    })
}

var alertInput = false

// Event handling
bot.onText(new RegExp(VISIBILITY_COMMAND), msg => {
    bot.sendPhoto(msg.from.id, KP_PHOTO).then(() => {
        const forecast = forecastHandler.getForecast()
        const arrowDown = '🔻'
        const arrowUp = '🔺'
        var message = `Current Kp index is ${forecast.nextH}`
        if (forecast.next4H == nexth) {
            message += ' without major changes within the next 4h.'
        } else if (forecast.next4H < forecast.nextH) {
            message += ` and within the next 4h it will decrease to ${forecast.next4H} ${arrowDown}.`
        } else {
            message += ` and within the next 4h it will increase to ${forecast.next4H} ${arrowUp}.`
        }
        bot.sendMessage(msg.from.id, message, options)
    })
})

bot.onText(new RegExp(PHOTO_COMMAND), msg => {
    bot.sendChatAction(msg.from.id, 'typing').then(() => {
        flickrHandler.fetchRandomPhoto((photo, owner) => {
           console.log('Sent photo: ' + photo + ' by ' + owner)
            bot.sendPhoto(msg.from.id, photo).then(() => {
                bot.sendMessage(msg.from.id, `A gorgeous photo by ${owner.replace(/[^a-zA-Z ]/g, "")}.`, options)
            })
        })
    })
})

bot.onText(new RegExp(CANCEL_ALERT_COMMAND), msg => {
    bot.sendMessage(msg.from.id, `Ok ${msg.from.first_name}, I won't be sending you any more alerts!`, options)
    forecastHandler.deregisterFromAlerts(msg.from.id)
})

bot.onText(new RegExp(SCHEDULE_ALERT_COMMAND), msg => {
    bot.sendPhoto(msg.from.id, KP_PHOTO).then(() => {
        bot.sendMessage(msg.from.id, 'Choose which Kp you\'d like to be informed about:', kpOptions)
        alertInput = true
    })
})

bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.from.id, `Hey ${msg.from.first_name}. What would you like to do?`, options)
})

bot.on('message', msg => {
    if (alertInput) {
        alertInput = false
        if (!isNaN(parseInt(msg.text))) {
            const value = parseInt(msg.text)
            if (value > 0 && value <= 8) {
                forecastHandler.registerForAlerts(msg.from.id, value)
                return bot.sendMessage(msg.from.id, `Ok, ${msg.from.first_name}, I will alert you when Kp is ${value}.`, options)
            }
        }
        bot.sendMessage(msg.from.id, 'Unrecognized answer. Please choose what you\'d like to do:', options)
    }
})

function onKpAlert(chats, kp) {
    chats.forEach(chat => {
        bot.sendMessage(chat.chatId, `⚠️ Alert! ⚠️ Alert! Current Kp is ${kp}!`)
    })
}