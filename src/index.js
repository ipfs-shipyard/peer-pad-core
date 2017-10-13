'use strict'

import Network from './network'
import IPFS from './backend/ipfs'
import generateRandomKeys from './backend/keys/generate'
import parseSymmetricalKey from './backend/keys/parse-symm-key'
import Document from './document'

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

export default createPeerpadBackend
export { generateRandomKeys, parseSymmetricalKey }
