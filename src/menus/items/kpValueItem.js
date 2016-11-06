'use strict'

const BaseItem = require('./baseItem')

class KpValueItem extends BaseItem {
    constructor (value, forecastHandler) {
        super()
        this.value = value
        this.forecastHandler = forecastHandler
    }

    get command() {
        return `${this.value}`
    }
    
    handleMessage(msg, bot, menu) {
        super.handleMessage(msg)
        console.info(`[MSG] KP value set for ${msg.from.first_name} :: ${this.value}`)
        const next = this._nextMenu 
        if (!next) { throw "KP value item needs a next menu!"}
        this.forecastHandler.registerForAlerts(msg.from.first_name, msg.from.id, this.value)
        const text = `Ok, ${msg.from.first_name}, I will alert you when Kp reaches ${this.value}.`
        bot.sendMessage(msg.from.id, text, next.options)
        return next
    }
}

module.exports = KpValueItem