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
        pubsub: true
      },
      config: {
        Addresses: {
          Swarm: [
            '/dns4/ws-star1.par.dwebops.pub/tcp/443/wss/p2p-websocket-star'
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
