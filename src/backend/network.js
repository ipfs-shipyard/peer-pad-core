'use strict'

const EventEmitter = require('events')

class Network {
  constructor (room) {
    this._room = room
  }

  observe () {
    return Observer(this._room)
  }
}

function Observer (room) {
  const ee = Object.assign(new EventEmitter(), {
    start: start,
    stop: stop
  })

  const listeners = {
    'peer joined': (peer) => ee.emit('peer joined', peer),
    'peer left': (peer) => ee.emit('peer left', peer),
    'received message': (peer, message) => ee.emit('received message', peer, message),
    'sent message': (peer, message) => ee.emit('sent message', peer, message)
  }

  start()

  return ee

  function start () {
    Object.keys(listeners).forEach((event) => {
      room.on(event, listeners[event])
    })
  }

  function stop () {
    Object.keys(listeners).forEach((event) => {
      room.removeListener(event, listeners[event])
    })
  }
}

module.exports = Network
