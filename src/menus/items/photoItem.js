'use strict'

const BaseItem = require('./baseItem')
const flickrHandler = require('../../flickrHandler')

class PhotoItem extends BaseItem {
    get command() {
        return '🌌 Aurora photo'
    }

    handleMessage(msg, bot, menu) {
        console.info(`[MSG] Aurora photo request from ${msg.from.first_name}`)
        super.handleMessage(msg)
        const next = menu
        bot.sendChatAction(msg.from.id, 'typing').then(() => {
            return flickrHandler.fetchRandomPhoto()
        }).then(result => {
            console.log(`Sent photo by ${result.owner} to ${msg.from.first_name}`)
            bot.sendPhoto(msg.from.id, result.photo).then(() => {
                bot.sendMessage(msg.from.id, `A gorgeous photo by ${result.owner}.`, next.options)
            })
        })
        
        return next
    }
}

module.exports = PhotoItem