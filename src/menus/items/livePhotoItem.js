'use strict'

const BaseItem = require('./baseItem')


class LivePhotoItem extends BaseItem {
     get command() {
        return '📷 Live photo'
    }

    handleMessage(msg, bot) {
        console.info(`[MSG] Live photo request from ${msg.from.first_name}`)
        super.handleMessage(msg)
        const next = this._nextMenu 
        if (!next) { throw "Live photo item needs a next menu!"}
        const text = 'Choose a SkyCam:'
        bot.sendMessage(msg.from.id, text, next.options)
        return next
    }
}

module.exports = LivePhotoItem