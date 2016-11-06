'use strict'

const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true })

const NavigationManager = require('./navigationManager')

const manager = new NavigationManager(bot)

bot.on('message', msg => {
    manager.processMessage(msg)
})
