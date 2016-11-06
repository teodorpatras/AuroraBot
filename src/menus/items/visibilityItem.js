'use strict'

const BaseItem = require('./baseItem')

class VisibilityItem extends BaseItem {
    constructor(forecastHandler, kpPhoto) {
        super()
        this.kpPhoto = kpPhoto
        this.forecastHandler = forecastHandler
    }

    get command() {
        return '🔎  Visibility'
    }

    handleMessage(msg, bot, menu) {
        super.handleMessage(msg)
        console.info(`[MSG] Visibility request from ${msg.from.first_name}`)
        const next = menu
        const forecast = this.forecastHandler.getForecast()
        bot.sendPhoto(msg.from.id, this.kpPhoto).then(() => {
            var text = `Current Kp index is ${forecast.nextH}`
            if (forecast.next4H == forecast.nextH) {
                text += ' without major changes within the next 4h.'
            } else if (forecast.next4H < forecast.nextH) {
                text += ` and within the next 4h it will 🔻 to ${forecast.next4H}.`
            } else {
                text += ` and within the next 4h it will 🔺 to ${forecast.next4H}.`
            }
            bot.sendMessage(msg.from.id, text, next.options)
        })
        
        return next
    }
}

module.exports = VisibilityItem