'use strict'

const Network = require('./network')
const IPFS = require('./backend/ipfs')
const Document = require('./document')

class PeerpadBackend {
  constructor (_options) {
    const options = _options || {}
    this.ipfs = IPFS(options.ipfs)
    this.network = new Network(this.ipfs)
  }

  createDocument (options) {
    return new Document(Object.assign({}, options, {
      ipfs: this.ipfs
    }))
  }
}

function createPeerpadBackend (options) {
  return new PeerpadBackend(options)
}

createPeerpadBackend.generateRandomName = require('./backend/keys/generate-random-name')
createPeerpadBackend.generateRandomKeys = require('./backend/keys/generate')
createPeerpadBackend.parseSymmetricalKey = require('./backend/keys/parse-symm-key')
module.exports = createPeerpadBackend
