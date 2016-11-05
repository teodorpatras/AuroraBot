'use strict'

const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot('258828278:AAEMsV2FRHzesM8S9POeGMyvEz_5TznSvTM', {polling: true})
const flickrHandler = require('./flickrHandler')

const PHOTO_COMMAND = 'Photo of the Aurora Borealis'
const VISIBILITY_COMMAND = 'Current visibility of the Aurora'
const ALERT_COMMAND = 'Schedule visibility alert'
const KP_PHOTO = 'http://www.aurora-service.eu/wp-content/uploads/2013/08/kp-map.png'

const options = {
    "parse_mode": "Markdown",
    "reply_markup": JSON.stringify({
        "keyboard": [
            [{text: PHOTO_COMMAND}],
            [{text: VISIBILITY_COMMAND}],
            [{text: ALERT_COMMAND}]
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

bot.onText(new RegExp(VISIBILITY_COMMAND), msg => {
    bot.sendPhoto(msg.from.id, KP_PHOTO).then(() => {
        bot.sendMessage(msg.from.id, 'Current Kp is 4', options)
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

bot.onText(new RegExp(ALERT_COMMAND), msg => {
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
                return bot.sendMessage(msg.from.id, `Ok, ${msg.from.first_name}, will alert you when Kp is ${value}.`, options)
            }
        }
        bot.sendMessage(msg.from.id, 'Unrecognized answer. Please choose what you\'d like to do:', options)
    }
})