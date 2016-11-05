'use strict'

const express = require('express')
const bot = require('./bot.js')
const dbHandler = require('./db/dbHandler')

const port = process.env.PORT || 5000
const app = express()

function connect(app, port) {
  return new Promise((resolve, reject) => {
    app.listen(port, err => {
      if (err) { return reject(err) }
      resolve()
    })
  })
}

connect(app, port).then(() => {
  console.log(`App is running on port ${port}`)
  return dbHandler.connect()
}).then(() => {
  console.log('Successfully connected to Mongo!')
}).catch(err => {
  console.error('Error: ' + err)
})

// prevent Dyno from going to sleep
const CronJob = require('cron').CronJob
const request = require('request')

new CronJob('*/15 * * * *', () => {
  request('https://aurorabot.herokuapp.com/')
}, null, true, 'America/Los_Angeles')