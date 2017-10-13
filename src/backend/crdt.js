'use strict'

const Buffer = require('safe-buffer').Buffer
const Y = require('yjs')
require('y-memory')(Y)
require('y-indexeddb-encrypted')(Y)
require('y-array')(Y)
require('y-text')(Y)
require('y-map')(Y)
require('y-richtext')(Y)
require('y-ipfs-connector')(Y)

module.exports = async function startCRDT (id, authToken, keys, ipfs, roomEmitter, auth) {
  const connectorOptions = {
    name: 'ipfs',
    room: roomName(id),
    ipfs: ipfs,
    auth: authToken,
    roomEmitter: roomEmitter,
    verifySignature: auth.verifySignature,
    checkAuth: auth.checkAuth
  }

  if (keys.write) {
    connectorOptions.sign = sign
  }

  connectorOptions.role = keys.write ? 'master' : 'slave'

  return Y({
    db: {
      name: 'indexeddb-encrypted',
      encode,
      decode
    },
    connector: connectorOptions,
    share: {
      name: 'Text',
      text: 'Text',
      richtext: 'Richtext',
      access: 'Map'
    }
  })

  // Signatures

  function sign (m, callback) {
    keys.write.sign(m, callback)
  }

  // Encryption

  function encode (m) {
    const source = createSourceBuffer(JSON.stringify(m))
    return Buffer.from(keys.cipher().encrypt(source)).toString('base64')
  }

  function decode (m) {
    const source = Buffer.from(m, 'base64')
    const decrypted = keys.cipher().decrypt(source)
    return JSON.parse(Buffer.from(decrypted).toString('utf8'))
  }
}

function roomName (id) {
  return 'peerpad/' + id.substring(0, Math.round(id.length / 2))
}

function createSourceBuffer (str) {
  const source = Buffer.from(str, 'utf8')
  const more = 16 - (source.length % 16)
  const ret = Buffer.alloc(source.length + more, ' ')
  source.copy(ret)
  return ret
}
