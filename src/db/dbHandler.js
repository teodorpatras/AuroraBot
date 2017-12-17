const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const address = process.env.MONGODB_URI
var connected = false

function connect() {    
  return new Promise((resolve, reject) => {
    mongoose.connect(address, err => {
        if (err) {
            connected = false
            reject(err)
        } else {
            connected = true
            resolve(address)
        }
    })
  })
}

function disconnect() {
    return mongoose.disconnect()
}

module.exports = {connect, disconnect}