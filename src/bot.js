const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true })

const flickrHandler = require('./flickrHandler')
const ForecastHandler = require('./forecastHandler')
const forecastHandler = new ForecastHandler(onKpAlert)

const PHOTO_COMMAND = '🌌 Aurora photo'
const VISIBILITY_COMMAND = '🔎  Visibility'
const SCHEDULE_ALERT_COMMAND = '🔔 Schedule alert'
const CANCEL_ALERT_COMMAND = '🔕 Unschedule alert'
const LIVE_PHOTO_COMMAND = '📷 Live photo'
const KP_PHOTO = 'https://www.dronewatch.nl/wp-content/uploads/2016/03/Kp-index.jpeg'

const FINLAND_OPTION_CAM_1 = '🇫🇮 Finland #1'
const FINLAND_OPTION_CAM_2 = '🇫🇮 Finland #2'
const SWEDEN_OPTION_CAM_1 = '🇸🇪 Sweden #1'
const SWEDEN_OPTION_CAM_2 = '🇸🇪 Sweden #2'
const NORWAY_OPTION_CAM_1 = '🇳🇴 Norway #1'
const NORWAY_OPTION_CAM_2 = '🇳🇴 Norway #2'

const COMMANDS = [PHOTO_COMMAND, VISIBILITY_COMMAND, SCHEDULE_ALERT_COMMAND, 
                  CANCEL_ALERT_COMMAND, LIVE_PHOTO_COMMAND, FINLAND_OPTION_CAM_1, FINLAND_OPTION_CAM_2,
                  SWEDEN_OPTION_CAM_1, SWEDEN_OPTION_CAM_2, NORWAY_OPTION_CAM_1, NORWAY_OPTION_CAM_2]

const options = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{ text: PHOTO_COMMAND }, { text: VISIBILITY_COMMAND }],
            [{ text: SCHEDULE_ALERT_COMMAND }, { text: CANCEL_ALERT_COMMAND }],
            [{ text: LIVE_PHOTO_COMMAND }]
        ]
    })
}

const camOptions = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{ text: FINLAND_OPTION_CAM_1 }, { text: FINLAND_OPTION_CAM_2 }],
            [{ text: NORWAY_OPTION_CAM_1 }, { text: NORWAY_OPTION_CAM_2 }],
            [{ text: SWEDEN_OPTION_CAM_1 }, { text: SWEDEN_OPTION_CAM_2 }]
        ]
    })
}

const kpOptions = {
    reply_markup: JSON.stringify({
        one_time_keyboard: true,
        keyboard: [
            [{ text: '1' }, { text: '2' }, { text: '3' }],
            [{ text: '4' }, { text: '5' }, { text: '6' }],
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
    const text = 'Choose a SkyCam:'
    bot.sendMessage(msg.from.id, text, camOptions)
    camInput = true
})

bot.onText(new RegExp(VISIBILITY_COMMAND), msg => {
    console.info(`[MSG] Visibility check from ${msg.from.first_name}`)
    bot.sendPhoto(msg.from.id, KP_PHOTO).then(() => {
        const forecast = forecastHandler.getForecast()
        var text = `Current Kp index is ${forecast.nextH}`
        if (forecast.next4H == forecast.nextH) {
            text += ' without major changes within the next 4h.'
        } else if (forecast.next4H < forecast.nextH) {
            text += ` and within the next 4h it will 🔻 to ${forecast.next4H}.`
        } else {
            text += ` and within the next 4h it will 🔺 to ${forecast.next4H}.`
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
        if (skyCams[msg.text]) {
            bot.sendChatAction(msg.from.id, 'typing')
            bot.sendLocation(msg.from.id, skyCams[msg.text].lat, skyCams[msg.text].lon).then(() => {
                const text = `SkyCam location: ${skyCams[msg.text].location}`
                return bot.sendMessage(msg.from.id, text) 
            }).then(() => {
                bot.sendPhoto(msg.from.id, `${skyCams[msg.text].url}?${Math.random()}`, options)
            })
        } else {
            return sendUnrecognizedMessage(msg.from.id)
        }
    } else if (COMMANDS.indexOf(msg.text) == -1){
        sendUnrecognizedMessage(msg.from.id)
    }
})

// Helper functions

function invalidateInputs() {
    alertInput = false
    camInput = false
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

var skyCams = {}
skyCams[SWEDEN_OPTION_CAM_1] = {
    url: 'http://uk.jokkmokk.jp/photo/nr3/latest.jpg',
    location: 'Porjus, Jokkmokk, Sweden',
    lat: 66.9592515,
    lon: 19.8130181
}
skyCams[SWEDEN_OPTION_CAM_2] = {
    url: 'http://www.aurora-service.eu/scripts/images/kiruna_aurora_sky_camera.jpg',
    location: 'Kiruna, Sweden',
    lat: 67.8537517,
    lon: 20.1863908
}
skyCams[FINLAND_OPTION_CAM_1] = {
    url: 'http://aurorasnow.fmi.fi/public_service/images/latest_DYN.jpg',
    location: 'Helsinki, Finland',
    lat: 60.170477,
    lon: 24.932778
}
skyCams[FINLAND_OPTION_CAM_2] = {
    url: 'http://www.sgo.fi/Data/RealTime/Kuvat/UCL.jpg',
    location: 'Sodankylä, Finland',
    lat: 67.416001,
    lon: 26.586784
}
skyCams[NORWAY_OPTION_CAM_1] = {
    url: 'http://polaris.nipr.ac.jp/~acaurora/aurora/Tromso/latest.jpg',
    location: 'Tromsø, Norway',
    lat: 69.649979,
    lon: 18.953976
}
skyCams[NORWAY_OPTION_CAM_2] = {
    url: 'http://polaris.nipr.ac.jp/~acaurora/aurora/Longyearbyen/latest.jpg',
    location: 'Svalbard Islands, Norway',
    lat: 78.5044091,
    lon: 13.0690518
}