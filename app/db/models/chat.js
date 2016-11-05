'use strict'

const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        unique: true
    },
    kp: Number,
    alertedAt: Date
})

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat