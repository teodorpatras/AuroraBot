'use strict'

const request = require('request')
const CronJob = require('cron').CronJob
const DATA_URL = 'http://services.swpc.noaa.gov/text/wing-kp.txt'
const dbHandler = require('./db/dbHandler.js')
const chatModel = require('./db/models/chat.js')

/*
#                      USAF 15-minute Wing Kp Geomagnetic Activity Index
#
#                        1-hour         1-hour        4-hour         4-hour     
# UT Date   Time      Predicted Time  Predicted    Predicted Time  Predicted   USAF Est.
# YR MO DA  HHMM      YR MO DA  HHMM    Index      YR MO DA  HHMM    Index        Kp    
#---------------------------------------------------------------------------------------
*/

const ALERT_INTERVAL = 60 * 60 * 1000 

dbHandler.connect().then(() => {
    console.log('Successfully connected to Mongo!')
}).catch(err => {
    console.error('Could not connect to mongoDB: ' + err)
})

var handler = function (alertCallback) {

    var nextH = '-1'
    var next4H = '-1'
    var job = null

    this.startDaemon = function() {
        if (job) {return}
        job = new CronJob('*/16 * * * *', () => {
            fetchData(handleFetchResult)
        }, null, false, 'America/Los_Angeles')
        job.start()
    }

    this.stopDaemon = function () {
        if (!job) {return}
        job.stop()
        job = null
    }

    this.registerForAlerts = function (user, chatId, kp) {
        chatModel.findOne({chatId}, (err, chat) => {
            if (chat) {
                chat.kp = kp
                chat.user = user
                chat.alertedAt = null
                chat.save(err => {
                    if (err) { console.error('Error on re-saving model: ' + err) }
                })
            } else {
                chatModel.create({user, chatId, kp}, (err, chat) => {
                    if (err) { return console.error('Error while creating model: ' + err) }
                })
            }
        })
    }

    this.deregisterFromAlerts = function(chatId) {
        chatModel.remove({chatId}, err => {
            if (err) { return console.error('Error while removing chat: ' + error) }
        })
    }

    this.getForecast = function () {
        return{nextH, next4H}
    }

    function handleFetchResult(err, next1, next4) {
        if (err) { return console.error(err) }
        console.log(`Next hour: ${next1} Next 4h: ${next4}`)
        nextH = next1
        next4H = next4
        var chats = []
        chatModel.find().where('kp').lte(parseInt(nextH)).exec((err, results) => {
            if (err) { return console.error('Error while fetching models: ' + err) }
            const date = new Date()
            results.forEach(chat => {
                if (!chat.alertedAt || date - chat.alertedAt >= ALERT_INTERVAL) {
                    chats.push(chat)
                    chat.alertedAt = date
                    chat.save()
                }
            })
            alertCallback(chats, nextH)
        })
    }

    function fetchData(completion) {
        request(DATA_URL, (err, response, body) => {
            if (err || response.statusCode != 200 || !body) {
                return completion(Error('Invalid request!'))
            }
            const data = parseData(body)
            completion(null, data[4], data[7])
        })
    }
    
    function parseData(body) {
        const data = body.split('\n')
        const latest = data[data.length - 2].split('  ')
        var result = []
        latest.forEach(str => {
            if (str.replace(/\s+/g, '').length > 0) {
                result.push(str)
            }
        })
        return result
    }
    fetchData(handleFetchResult)
    this.startDaemon()
}

module.exports = handler