'use strict'

class BaseItem {

    set nextMenu (value) {
        this._nextMenu = value
    }

    get command() {
        return null
    }

    handleMessage(msg) {
        if (msg.text != this.command) { throw new Error('Command mismatch!') }
        return null
    } 
}

module.exports = BaseItem