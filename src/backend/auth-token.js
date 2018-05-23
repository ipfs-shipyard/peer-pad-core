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
        (ipfsToken, cb) => {
          ipfsToken = ipfsToken && ipfsToken.toString('base64')
          const token = {
            token: ipfsToken
          }
          if (window.web3) {
            const did = window.localStorage.getItem('DID')
            if (did) {
              peerPadEthereumSignature.signIpfsId(ipfs, did).then(signatureData => {
                token.ethereumWalletInfo = JSON.stringify(signatureData).toString('base64')
                cb(null, token)
              })
            } else {
              cb(null, token)
            }
          } else {
            cb(null, token)
          }
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
