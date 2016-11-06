'use strict'

const BaseItem = require('./baseItem')

class LiveCamItem extends BaseItem {
    constructor (camDict) {
        super()
        this.camDict = camDict
    }
     get command() { 
         return this.camDict.command
     }

     handleMessage(msg, bot) {
         super.handleMessage(msg)
         console.info(`[MSG] LiveCam sent to from ${msg.from.first_name} ::: ${this.camDict.location}`)
         const next = this._nextMenu
         if (!next) { throw "Live cam item needs a next menu!"}
         const cam = this.camDict
         bot.sendChatAction(msg.from.id, 'typing').then(() => {
             return bot.sendLocation(msg.from.id,cam.lat,cam.lon)
         }).then(() => {
             const text = `SkyCam location: ${cam.location}`
             return bot.sendMessage(msg.from.id, text) 
          }).then(() => {
             return bot.sendChatAction(msg.from.id, 'typing')
          }).then(() => {
             bot.sendPhoto(msg.from.id, `${cam.url}?${Math.random()}`, next.options)
          })
          return next
      }
}

module.exports = LiveCamItem