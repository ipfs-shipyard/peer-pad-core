'use strict'

const POLL_INTERVAL = 1000

module.exports = function awaitIpfsInit (ipfs) {
  return new Promise((resolve, reject) => {
    // if (ipfs.isOnline()) {
    //   resolve()
    // } else {
    //   ipfs.once('ready', resolve)
    // }

    (function checkPeerInfo () {
      if (ipfs._peerInfo && ipfs._peerInfo.id) {
        resolve(ipfs._peerInfo.id)
      } else {
        setTimeout(checkPeerInfo, POLL_INTERVAL)
      }
    })()
  })
}
