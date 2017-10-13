'use strict'

const IPFS = require('ipfs')

function maybeCreateIPFS (_ipfs) {
  let ipfs = _ipfs

  if (!ipfs) {
    ipfs = new IPFS({
      EXPERIMENTAL: {
        pubsub: true
      }
    })
  }

  return ipfs
}

module.exports = maybeCreateIPFS
