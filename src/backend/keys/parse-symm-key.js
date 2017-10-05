'use strict'

import { decode as b58Decode } from 'bs58'
import crypto from 'libp2p-crypto'
import pify from 'pify'

const createKey = pify(crypto.aes.create.bind(crypto.aes))

const defaultOptions = {
  keyLength: 32,
  ivLength: 16
}

function parseSymmetricalKey(string, _options) {
  const options = Object.assign({}, defaultOptions, _options)
  const rawKey = b58Decode(string)

  return createKey(
    rawKey.slice(0, options.keyLength),
    rawKey.slice(options.keyLength, options.keyLength + options.ivLength))
}

export default parseSymmetricalKey
