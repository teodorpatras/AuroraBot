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
const LIVE_PHOTO_COMMAND = '📷 Live photo'
const KP_PHOTO = 'https://www.whelancameras.ie/image/data/Article/image%202.jpg'

const FINLAND_OPTION_CAM_1 = '🇫🇮 Finland #1'
const FINLAND_OPTION_CAM_2 = '🇫🇮 Finland #2'
const SWEDEN_OPTION_CAM_1 = '🇸🇪 Sweden #1'
const SWEDEN_OPTION_CAM_2 = '🇸🇪 Sweden #2'
const NORWAY_OPTION_CAM_1 = '🇳🇴 Norway #1'
const NORWAY_OPTION_CAM_2 = '🇳🇴 Norway #2'

const options = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{text: PHOTO_COMMAND}, {text: VISIBILITY_COMMAND}],
            [{text: SCHEDULE_ALERT_COMMAND}, {text: CANCEL_ALERT_COMMAND}],
            [{text: LIVE_PHOTO_COMMAND}]
        ]
    })
}

const camOptions = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{text: FINLAND_OPTION_CAM_1}, {text: FINLAND_OPTION_CAM_2}],
            [{text: NORWAY_OPTION_CAM_1}, {text: NORWAY_OPTION_CAM_2}],
            [{text: SWEDEN_OPTION_CAM_1}, {text: SWEDEN_OPTION_CAM_2}]
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
var camInput = false

// Event handling

bot.onText(new RegExp(LIVE_PHOTO_COMMAND), msg => {
    invalidateInputs()
    console.info(`[MSG] Live photo request from ${msg.from.first_name}`)
    const text = 'Choose a sky camera:'
    bot.sendMessage(msg.from.id, text, camOptions)
    camInput = true
})

bot.onText(new RegExp(VISIBILITY_COMMAND), msg => {
    console.info(`[MSG] Visibility check from ${msg.from.first_name}`)
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
    console.info(`[MSG] Send photo to ${msg.from.first_name}`)
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
    console.info(`[MSG] Cancel alert from ${msg.from.first_name}`)
    const text = `Ok ${msg.from.first_name}, I won't be sending you any more alerts!`
    bot.sendMessage(msg.from.id, text, options)
    forecastHandler.deregisterFromAlerts(msg.from.id)
})

bot.onText(new RegExp(SCHEDULE_ALERT_COMMAND), msg => {
    invalidateInputs()
    console.info(`[MSG] Schedule alert for ${msg.from.first_name}`)
    bot.sendPhoto(msg.from.id, KP_PHOTO).then(() => {
        const text = 'Choose which Kp index you\'d like to be informed about:'
        bot.sendMessage(msg.from.id, text, kpOptions)
        alertInput = true
    })
})

bot.onText(/\/start/, (msg, match) => {
    console.info(`[MSG] /start from ${msg.from.first_name}`)
    const text = `Hey ${msg.from.first_name}! What would you like to do?`
    bot.sendMessage(msg.from.id, text, options)
})

bot.on('message', msg => {
    if (alertInput) {
        alertInput = false
        const value = parseInt(msg.text)
        if (value > 0 && value <= 8) {
            forecastHandler.registerForAlerts(msg.from.first_name, msg.from.id, value)
            const text = `Ok, ${msg.from.first_name}, I will alert you when Kp reaches ${value}.`
            return bot.sendMessage(msg.from.id, text, options)
        }
        sendUnrecognizedMessage(msg.from.id)
    } else if (camInput) {
        camInput = false
        const photos = getLivePhotos()
        if (photos[msg.text]) {
            return bot.sendChatAction(msg.from.id, 'typing').then(() => {
                return bot.sendPhoto(msg.from.id, photos[msg.text].url)
            }).then(() => {
                const text = `Here's a photo from ${photos[msg.text].location}.`
                bot.sendMessage(msg.from.id, text, options)
            })
        }
        return sendUnrecognizedMessage(msg.from.id)
    }
})

// Helper functions

function invalidateInputs() {
    alertInput = false
    camInput = false
}

function getLivePhotos() {
    var dict = {}
    dict[SWEDEN_OPTION_CAM_1] = {url: `http://uk.jokkmokk.jp/photo/nr3/latest.jpg?${Math.random()}`, location: 'Porjus, Jokkmokk, Sweden'}
    dict[SWEDEN_OPTION_CAM_2] = {url: `http://www.aurora-service.eu/scripts/images/kiruna_aurora_sky_camera.jpg?${Math.random()}`, location: 'Kiruna, Sweden'}
    dict[FINLAND_OPTION_CAM_1] = {url: `http://aurora.fmi.fi/public_service/latest_DYN.jpg?${Math.random()}`, location: 'Helsinki, Finland'}
    dict[FINLAND_OPTION_CAM_2] = {url: `http://www.sgo.fi/Data/RealTime/Kuvat/UCL.jpg?${Math.random()}`, location: 'Sodankylä, Finland'}
    dict[NORWAY_OPTION_CAM_1] = {url: `http://polaris.nipr.ac.jp/~acaurora/aurora/Tromso/latest.jpg?${Math.random()}`, location: 'Tromsø, Norway'}
    dict[NORWAY_OPTION_CAM_2] = {url: `http://polaris.nipr.ac.jp/~acaurora/aurora/Longyearbyen/latest.jpg?${Math.random()}`, location: 'Svalbard Islands, Norway'}
    return dict
}

function sendUnrecognizedMessage(chatId) {
    const text = 'Unrecognized answer. Please choose what you\'d like to do:'
    bot.sendMessage(chatId, text, options)
}

function onKpAlert(chats, kp) {
    chats.forEach(chat => {
        console.info(`[MSG] Send alert to ${chat.user}`)
        const text = `⚠️ Alert! ⚠️ Alert! Current Kp is ${kp}!`
        bot.sendMessage(chat.chatId, text)
    })
}