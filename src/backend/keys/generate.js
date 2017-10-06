'use strict'

import { keys } from 'libp2p-crypto'
import encode from './encode'

const defaultOptions = {
  algo: 'Ed25519',
  bits: 512
}

async function generateKeys (options) {
  return new Promise((resolve, reject) => {
    options = Object.assign({}, defaultOptions, options)
    keys.generateKeyPair(options.algo, options.bits, (err, key) => {
      if (err) { return reject(err) }
      resolve({
        'read': encode(keys.marshalPublicKey(key.public)),
        'write': encode(keys.marshalPrivateKey(key))
      })
    })
  })
}

export default generateKeys
