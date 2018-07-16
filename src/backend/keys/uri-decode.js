'use strict'

const decode = require('bs58')

function decodeKey (key) {
  return decode(decodeURIComponent(key))
}

module.exports = decodeKey
