'use strict'

import Y from 'yjs'

import YMemory from 'y-memory'
import YIndexeddb from 'y-indexeddb-encrypted'
import YArray from 'y-array'
import YText from 'y-text'
import YMap from 'y-map'
import YRichtext from 'y-richtext'
import YIPFS from 'y-ipfs-connector'

import { Buffer } from 'safe-buffer'

YMemory(Y)
YIndexeddb(Y)
YArray(Y)
YText(Y)
YMap(Y)
YRichtext(Y)
YIPFS(Y)

export default async function startCRDT (id, authToken, keys, ipfs, roomEmitter, auth) {
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
    const result = JSON.parse(Buffer.from(decrypted).toString('utf8'))
    return result
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
