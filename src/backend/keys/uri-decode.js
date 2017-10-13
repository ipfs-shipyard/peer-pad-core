'use strict'

const decode = require('bs58')

export default function decodeKey (key) {
  return decode(decodeURIComponent(key))
}
