const mongoose = require('mongoose')

const ChatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        unique: true
    },
    user: String,
    kp: Number,
    alertedAt: Date
})

const Chat = mongoose.model('Chat', ChatSchema)

module.exports = Chat