'use strict'

const IPFS = require('ipfs')

function maybeCreateIPFS (_ipfs) {
  let ipfs = _ipfs
  let _resolve

  const ret = new Promise((resolve, reject) => {
    if (ipfs) {
      resolve(ipfs)
    } else {
      _resolve = resolve
    }
  })

  ret.start = () => {
    if (ipfs) {
      return ipfs
    }

    console.log('creating IPFS')
    ipfs = new IPFS({
      EXPERIMENTAL: {
        pubsub: true,
        relay: {
          enabled: true
        }
      },
      config: {
        Addresses: {
          Swarm: [
          ]
        }
      }
    })

    if (_resolve) {
      _resolve(ipfs)
    }

    return ipfs
  }

  return ret
}

module.exports = maybeCreateIPFS
