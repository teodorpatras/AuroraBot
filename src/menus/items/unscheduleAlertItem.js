'use strict'

const BaseItem = require('./baseItem')

class UnscheduleAlertItem extends BaseItem {
    constructor (forecastHandler) {
        super()
        this.forecastHandler = forecastHandler
    }

    get command() {
        return '🔕 Unschedule alert'
    }

    handleMessage(msg, bot, menu) {
        super.handleMessage(msg)
        console.info(`[MSG] Unschedule alert for ${msg.from.first_name}`)
        const next = menu
        const text = `Ok ${msg.from.first_name}, I won't be sending you any more alerts!`
        bot.sendMessage(msg.from.id, text, next.options)
        this.forecastHandler.deregisterFromAlerts(msg.from.id)
        return next
    }
}

module.exports = UnscheduleAlertItem