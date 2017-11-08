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
    checkAuth: auth.checkAuth,
    encode: encodeMessage,
    decode: decodeMessage
  }

  if (keys.write) {
    connectorOptions.sign = sign
  }

  connectorOptions.role = keys.write ? 'master' : 'slave'

  return Y({
    db: {
      name: 'indexeddb-encrypted',
      encode: encodeRecord,
      decode: decodeRecord
    },
    connector: connectorOptions,
    share: {
      name: 'Text',
      text: 'Text',
      richtext: 'Richtext',
      access: 'Map',
      peerAliases: 'Map'
    }
  })

  // Signatures

  function sign (m, callback) {
    keys.write.sign(m, callback)
  }

  // Encryption

  function encode (m) {
    if (!Buffer.isBuffer(m)) {
      if (m instanceof Uint8Array) {
        return encode(Buffer.from(m))
      }
      if (typeof m === 'string') {
        return encode(Buffer.from(m))
      }
      return encode(JSON.stringify(m))
    }

    return Buffer.from(keys.cipher().encrypt(createSourceBuffer(m)))
  }

  function encodeMessage (m) {
    return encode(m)
  }

  function encodeRecord (m) {
    return encode(m).toString('base64')
  }

  function decode (m) {
    if (!Buffer.isBuffer(m)) {
      if (m instanceof Uint8Array) {
        return decode(Buffer.from(m))
      }
      throw new Error('trying to decode something that is not a buffer', m)
    }
    const mb = Buffer.from(keys.cipher().decrypt(m))
    return JSON.parse(mb.toString('utf8'))
  }

  function decodeRecord (m) {
    return decode(Buffer.from(m, 'base64'))
  }

  function decodeMessage (m) {
    let source = Buffer.from(m)
    if ((source.length % 16) !== 0) {
      throw new Error('invalid message length: ' + source.length)
    }
    return decode(source)
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
