'use strict'

const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {polling: true})

const flickrHandler = require('./flickrHandler')
const ForecastHandler = require('./forecastHandler')
const forecastHandler = new ForecastHandler(onKpAlert)

const PHOTO_COMMAND = '🌌 Aurora photo'
const VISIBILITY_COMMAND = '🔎  Visibility'
const SCHEDULE_ALERT_COMMAND = '🔔 Schedule alert'
const CANCEL_ALERT_COMMAND = '🔕 Unschedule alert'
const KP_PHOTO = 'https://www.whelancameras.ie/image/data/Article/image%202.jpg'

const options = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{text: PHOTO_COMMAND}, {text: VISIBILITY_COMMAND}],
            [{text: SCHEDULE_ALERT_COMMAND}, {text: CANCEL_ALERT_COMMAND}]
        ]
    })
}

const kpOptions = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{ text: '1' }, { text: '2' }, { text: '3'}],
            [{ text: '4' }, { text: '5' }, { text: '6'}],
            [{ text: '7' }, { text: '8' }]
        ]
    })
}

var alertInput = false

// Event handling
bot.onText(new RegExp(VISIBILITY_COMMAND), msg => {
    console.info(`[MSG]Visibility check from ${msg.from.first_name}`)
    bot.sendPhoto(msg.from.id, KP_PHOTO).then(() => {
        const forecast = forecastHandler.getForecast()
        const arrowDown = '🔻'
        const arrowUp = '🔺'
        var text = `Current Kp index is ${forecast.nextH}`
        if (forecast.next4H == forecast.nextH) {
            text += ' without major changes within the next 4h.'
        } else if (forecast.next4H < forecast.nextH) {
            text += ` and within the next 4h it will decrease to ${forecast.next4H} ${arrowDown}.`
        } else {
            text += ` and within the next 4h it will increase to ${forecast.next4H} ${arrowUp}.`
        }
        bot.sendMessage(msg.from.id, text, options)
    })
})

bot.onText(new RegExp(PHOTO_COMMAND), msg => {
    console.info(`[MSG]Send photo to ${msg.from.first_name}`)
    bot.sendChatAction(msg.from.id, 'typing').then(() => {
        return flickrHandler.fetchRandomPhoto()
    }).then(result => {
        console.log(`Sent photo by ${result.owner} to ${msg.from.first_name}`)
        bot.sendPhoto(msg.from.id, result.photo).then(() => {
            bot.sendMessage(msg.from.id, `A gorgeous photo by ${result.owner}.`, options)
        })
    })
})

bot.onText(new RegExp(CANCEL_ALERT_COMMAND), msg => {
    console.info(`[MSG]Cancel alert from ${msg.from.first_name}`)
    const text = `Ok ${msg.from.first_name}, I won't be sending you any more alerts!`
    bot.sendMessage(msg.from.id, text, options)
    forecastHandler.deregisterFromAlerts(msg.from.id)
})

bot.onText(new RegExp(SCHEDULE_ALERT_COMMAND), msg => {
    console.info(`[MSG]Schedule alert for ${msg.from.first_name}`)
    bot.sendPhoto(msg.from.id, KP_PHOTO).then(() => {
        const text = 'Choose which Kp index you\'d like to be informed about:'
        bot.sendMessage(msg.from.id, text, kpOptions)
        alertInput = true
    })
})

bot.onText(/\/start/, (msg, match) => {
    console.info(`[MSG]/start from ${msg.from.first_name}`)
    const text = `Hey ${msg.from.first_name}! What would you like to do?`
    bot.sendMessage(msg.from.id, text, options)
})

bot.on('message', msg => {
    if (!alertInput) { return }
    alertInput = false
    const value = parseInt(msg.text)
    if (value > 0 && value <= 8) {
        forecastHandler.registerForAlerts(msg.from.first_name, msg.from.id, value)
        const text = `Ok, ${msg.from.first_name}, I will alert you when Kp reaches ${value}.`
        return bot.sendMessage(msg.from.id, text, options)
    }
    const text = 'Unrecognized answer. Please choose what you\'d like to do:'
    bot.sendMessage(msg.from.id, text, options)
})

function onKpAlert(chats, kp) {
    chats.forEach(chat => {
        console.info(`[MSG]Send alert to ${chat.user}`)
        const text = `⚠️ Alert! ⚠️ Alert! Current Kp is ${kp}!`
        bot.sendMessage(chat.chatId, text)
    })
}