'use strict'

class BaseMenu {
    constructor (items) {
        this.items = items
        this._options = this._configureOptions()
    }

    get options () {
        return this._options
    }

    handleMessage(msg, bot) {
        const self = this
        var result = null
        this.items.forEach(item => {
            if (item.command == msg.text) {
                result = item.handleMessage(msg, bot, self)
                return
            }
        })
        // return null if none of the menu items know how to deal with the command
        return result
    }

    _configureOptions() {
        const items = this.items
        var keyboard = []
        var i
        for (i = 1; i < items.length; i += 2) {
            keyboard.push([{text: items[i-1].command}, {text: items[i].command}])
        }
        
        // push the last item in its own array, if exists
        if (i == items.length) {
            keyboard.push(([{text: items[i - 1].command}]))
        }

        return {
            reply_markup: JSON.stringify({
                one_time_keyboard: true,
                keyboard: keyboard
            })
        }
    }
}

module.exports = BaseMenu