'use strict'

const EventEmitter = require('events')
const b58Decode = require('bs58').decode
const Y = require('yjs')

const parseKeys = require('./keys/parse')
const authToken = require('./auth-token')
const CRDT = require('./crdt')
const Auth = require('./auth')
const generateSymmetricalKey = require('./keys').generateSymmetrical
const awaitIpfsInit = require('./await-ipfs-init')
const Network = require('./network')
const migrateIpfsRepoIfNecessary = require('./migrate-ipfs-repo-if-necessary')
const crypto = require('crypto')
const dblSha256 = (data) => crypto.createHash('sha256').update(crypto.createHash('sha256').update(data).digest()).digest('hex')

class Backend extends EventEmitter {
  constructor (options) {
    super()
    this._options = options
    this.room = new EventEmitter()
    this.ipfs = options.ipfs
    this.keys = {
      generateSymmetrical: generateSymmetricalKey
    }
    this.network = new Network(this.room)
    this._handleError = this._handleError.bind(this)
  }

  async start () {
    const options = this._options
    this.padId = 'pad#' + dblSha256(options.readKey) // hash readKey so we don't give the rendezvous access by registering with it as id

    // ---- start js-ipfs

    // migrate repo if necessary
    await migrateIpfsRepoIfNecessary()

    this.ipfs = this.ipfs.start()

    // Listen for errors
    this.ipfs.on('error', this._handleError)

    // if IPFS node is not online yet, delay the start until it is
    await awaitIpfsInit(this.ipfs)
    this.ipfs.rendezvous.register(this.padId) // register on pad namespace for discovery
    this.ipfs.rendezvous.on('ns:' + this.padId, peer => { // HACK: should discover over libp2p discovery instead
      console.log('discovered peer %s', peer.multiaddrs.toArray().map(String).join(', '))
      this.ipfs._libp2pNode.dial(peer, console.log)
    })

    // ---- initialize keys
    this._keys = await parseKeys(b58Decode(options.readKey), options.writeKey && b58Decode(options.writeKey))

    const token = await authToken(this.ipfs, this._keys)
    this.auth = Auth(this._keys, this.room)
    this.crdt = await CRDT(this._options.name, token, this._keys, this.ipfs, this.room, this.auth)
    this.crdt.share.access.observeDeep(this.auth.observer())

    this.auth.on('change', (peerId, newCapabilities) => {
      let capabilities = this.crdt.share.access.get(peerId)
      if (!capabilities) {
        this.crdt.share.access.set(peerId, Y.Map)
        capabilities = this.crdt.share.access.get(peerId)
      }
      if (newCapabilities) {
        Object.keys(newCapabilities).forEach((capabilityName, hasPermission) => {
          if (capabilities.get(capabilityName) !== newCapabilities[capabilityName]) {
            capabilities.set(capabilityName, hasPermission)
          }
        })
      } else {
        capabilities.delete(peerId)
      }
    })

    this.emit('started')
  }

  stop () {
    this.ipfs.removeListener('error', this._handleError)
    this.crdt.share.access.unobserve(this._observer)
    this._observer = null
  }

  _handleError (err) {
    this.emit('error', err)
  }
}

module.exports = Backend
