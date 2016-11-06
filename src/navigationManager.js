'use strict'

const ForecastHandler = require('./forecastHandler')

const PhotoItem = require('./menus/items/photoItem')
const VisibilityItem = require('./menus/items/visibilityItem')
const LiveCamItem = require('./menus/items/liveCamItem')
const LivePhotoItem = require('./menus/items/livePhotoItem')
const KpValueItem = require('./menus/items/kpValueItem')
const ScheduleAlertItem = require('./menus/items/scheduleAlertItem')
const UnscheduleAlertItem = require('./menus/items/unscheduleAlertItem')

const BaseMenu = require('./menus/baseMenu')

const SKY_CAMS = require('./shared/skyCams')
const KP_PHOTO = 'https://www.whelancameras.ie/image/data/Article/image%202.jpg'
const MAX_KP = 8

class NavigationManager {
    constructor(bot) {
        this.bot = bot
        this.forecastHandler = new ForecastHandler(bot, this._onKpAlert)
        this.mainMenu = this._buildNavigation()
        this.currentMenu = this.mainMenu
    }

    processMessage(msg) {
        this.currentMenu = this.currentMenu.handleMessage(msg, this.bot)
        if (!this.currentMenu) {
            // unrecognized message received
            this.currentMenu = this.mainMenu
            const message = msg.text == '/start' ? '/start message' : 'unrecognized message'
            const hello = `Hey ${msg.from.first_name}! What would you like to do?`
            const unrecognized = 'No, no no. Let\'s roll back. Please choose what you\'d like to do:'
            const text = msg.text == '/start' ? hello : unrecognized

            console.info(`[MSG] unrecognized message from ${msg.from.first_name} :: ${msg.text}`)
            this.bot.sendMessage(msg.from.id, text, this.mainMenu.options)
        }
    }

    _buildNavigation() {
        const photoItem = new PhotoItem()
        const visibilityItem = new VisibilityItem(this.forecastHandler, KP_PHOTO)
        const livePhotoItem = new LivePhotoItem()
        const scheduleItem = new ScheduleAlertItem(KP_PHOTO)
        const unscheduleItem = new UnscheduleAlertItem(this.forecastHandler)
        const mainMenu = new BaseMenu([photoItem, visibilityItem, scheduleItem, unscheduleItem, livePhotoItem])

        const kpMenu = new BaseMenu(this._computeKPItems(mainMenu))
        const camMenu = new BaseMenu(this._computeCamItems(mainMenu))
        // assign nextMenu only when changing the current menu
        scheduleItem.nextMenu = kpMenu
        livePhotoItem.nextMenu = camMenu
        return mainMenu
    }

    _onKpAlert(bot, chats, kp) {
        chats.forEach(chat => {
            console.info(`[MSG] Sent alert to ${chat.user}`)
            const text = `⚠️ Alert! ⚠️ Alert! Current Kp is ${kp}!`
            bot.sendMessage(chat.chatId, text)
        })
    }

    _computeKPItems(menu) {
        var items = []
        for (let i = 1; i <= MAX_KP; i++) {
            const item = new KpValueItem(i, this.forecastHandler)
            item.nextMenu = menu
            items.push(item)
        }
        return items
    }

    _computeCamItems(menu) {
        var items = []
        SKY_CAMS.forEach(dict => {
            const item = new LiveCamItem(dict)
            item.nextMenu = menu
            items.push(item)
        })
        return items
    }
}


module.exports = NavigationManager