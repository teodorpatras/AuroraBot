'use strict'

const BaseItem = require('./baseItem')

class ScheduleAlertItem extends BaseItem {
    constructor(kpPhoto) {
        super()
        this.kpPhoto = kpPhoto
    }

    get command() {
        return '🔔 Schedule alert'
    }

    handleMessage(msg, bot) {
        super.handleMessage(msg)
        console.info(`[MSG] Schedule alert for ${msg.from.first_name}`)
        const next = this._nextMenu 
        if (!next) { throw "Schedule alert item needs a next menu!"}
        bot.sendPhoto(msg.from.id, this.kpPhoto).then(() => {
            const text = 'Choose which Kp index you\'d like to be informed about:'
            bot.sendMessage(msg.from.id, text, next.options)
        })
        return next
    }
}

module.exports = ScheduleAlertItem