'use strict'

const waterfall = require('async/waterfall')
var peerPadEthereumSignature = require('peer-pad-ethereum-signature')

// exports.verifyIpfsIdSignature = function (ipfs, from, signature) {
// exports.signIpfsId = function (ipfs) {

module.exports = async function authTokenFromIpfsId (ipfs, keys, ethereumWalletInfo) {
  return new Promise((resolve, reject) => {
    waterfall(
      [
        (cb) => ipfs.id(cb),
        (info, cb) => {
          cb(null, info.id)
        },
        (nodeId, cb) => {
          if (!keys.write) {
            cb(null, null)
          } else {
            keys.write.sign(Buffer.from(nodeId), cb)
          }
        },
        (token, cb) => {
          peerPadEthereumSignature.signIpfsId(ipfs).then(signatureData => {
            let send = {ethereumWalletInfo: JSON.stringify(signatureData).toString('base64'), token: token && token.toString('base64')}
            send = JSON.stringify(send)
          // cb(null, token && token.toString('base64'))
            cb(null, send)
          })
        }
      ],
      (err, token) => {
        if (err) {
          reject(err)
        } else {
          resolve(token)
        }
      }
    )
  })
}
