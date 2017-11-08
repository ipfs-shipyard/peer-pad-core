'use strict'

const EventEmitter = require('events')

class Peers extends EventEmitter {
  constructor (options, backend) {
    super()

    this._peers = {}
    this._backend = backend

    backend.once('started', () => {
      const me = this._ensurePeer(this._backend.ipfs._peerInfo.id.toB58String())
      me.me = true

      backend.auth.on('change', (peerId, capabilities) => {
        if (!capabilities) {
          delete this._peers[peerId]
        } else {
          const peer = this._ensurePeer(peerId)
          peer.permissions = Object.assign({}, capabilities)
        }

        this._roomChanged()
      })

      backend.crdt.share.peerAliases.observe((event) => {
        const peerName = event.name
        if (['update', 'insert'].indexOf(event.type) >= 0) {
          const peer = this._ensurePeer(peerName)
          peer.alias = event.value
          this._roomChanged()
        }
      })

      if (options.alias) {
        // Because Y of a race condition (internal to pubsub-room or Y.js),
        // delay setting the peer alias
        // TODO: fix this
        setTimeout(() => this.setPeerAlias(options.alias), 1000)
      }
    })
  }

  all () {
    return this._peers
  }

  setPeerAlias (alias) {
    const peerId = this._backend.ipfs._peerInfo.id.toB58String()
    const currentAlias = this._backend.crdt.share.peerAliases.get(peerId)
    if (!currentAlias || currentAlias !== alias) {
      this._backend.crdt.share.peerAliases.set(peerId, alias)
    }
    const me = this._ensurePeer(peerId)
    me.alias = alias
  }

  _roomChanged () {
    this.emit('change')
  }

  _ensurePeer (peerId) {
    let peer = this._peers[peerId]
    if (!peer) {
      peer = this._peers[peerId] = {
        id: peerId,
        alias: this._backend.crdt.share.peerAliases.get(peerId) || peerId,
        permissions: {}
      }
    }

    return peer
  }
}

module.exports = Peers
