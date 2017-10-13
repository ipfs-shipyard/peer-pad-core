'use strict'

const encode = require('bs58').encode

module.exports = function encodeKey (key) {
  return encode(Buffer.from(key))
}
