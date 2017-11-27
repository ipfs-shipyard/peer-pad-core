'use strict'

const IPFS = require('ipfs')

function maybeCreateIPFS (_ipfs) {
  let ipfs = _ipfs
  let resolve
  let reject

  const ret = new Promise((_resolve, _reject) => {
    if (ipfs) {
      resolve(ipfs)
    } else {
      resolve = _resolve
      reject = _reject
    }
  })

  ret.start = () => {
    if (ipfs) {
      return ipfs
    }

    console.log('creating IPFS')
    ipfs = new IPFS({
      EXPERIMENTAL: {
        pubsub: true
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star.discovery.libp2p.io/wss/p2p-websocket-star'
          ]
        }
      }
    })

    if (resolve) {
      resolve(ipfs)
    }

    return ipfs
  }

  return ret
}

module.exports = maybeCreateIPFS
