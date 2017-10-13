'use strict'

const EventEmitter = require('events')

class Network extends EventEmitter {
  constructor (ipfs) {
    super()
    if (!ipfs.isOnline()) {
      ipfs.once('ready', () => {
        this.emit('started')
      })
    }
  }
}

module.exports = Network
