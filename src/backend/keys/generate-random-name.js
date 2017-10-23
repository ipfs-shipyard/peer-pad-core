'use strict'

const randomBytes = require('libp2p-crypto').randomBytes
const encode = require('./encode')

function generateRandomName () {
  return encode(randomBytes(16))
}

module.exports = generateRandomName
