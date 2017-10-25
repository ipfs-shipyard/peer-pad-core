'use strict'

const EventEmitter = require('events')

class Network extends EventEmitter {
  constructor (ipfs) {
    super()
    this._started = false

    if (ipfs.isOnline()) {
      setImmediate(this._onStart.bind(this))
    } else {
      ipfs.once('ready', this._onStart.bind(this))
    }
  }

  _onStart () {
    this._started = true
    this.emit('started')
  }

  hasStarted () {
    return this._started
  }
}

module.exports = Network
