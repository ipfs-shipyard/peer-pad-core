'use strict'

const crypto = require('libp2p-crypto')
const parallel = require('async/parallel')
const AES = require('aes-js')

module.exports = async function parseKeys (readKey, writeKey) {
  return new Promise((resolve, reject) => {
    parallel({
      read: (callback) => callback(null, crypto.keys.unmarshalPublicKey(readKey)),
      write: (callback) => writeKey ? crypto.keys.unmarshalPrivateKey(writeKey, callback) : callback(null, null),
      cipher: (callback) => callback(null, createAESKeyFromReadKey(readKey))
    }, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

function createAESKeyFromReadKey (key) {
  const keyBytes = key.slice(0, 16)
  const iv = key.slice(16, 16 + 16)
  // eslint-disable-next-line new-cap
  return () => new AES.ModeOfOperation.cbc(keyBytes, iv)
}
