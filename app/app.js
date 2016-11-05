'use strict'

const express = require('express')
const bot = require('./bot.js')

const port = process.env.PORT || 5000
const app = express()

app.listen(port, () => {
  console.log(`Node app is running on port ${port}`)
})