'use strict'

import { Buffer } from 'safe-buffer'
import DeltaToHTML from 'quill-delta-to-html'
import pify from 'pify'
import { encode as b58Encode } from 'bs58'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Buffer } from 'safe-buffer'
import { version } from '../package.json'

class Snapshots {
  constructor (options, backend) {
    this._options = options
    this._DocViewer = this._options.docViewer
    this._backend = backend
  }

  async take () {
    let doc
    if (this._options.type === 'richtext') {
      const delta = this._backend.crdt.share.richtext.toDelta()
      const converter = new DeltaToHTML(delta, {})
      doc = Buffer.from(converter.convert())
    } else {
      // TODO: other types
    }

    if (doc) {
      const key = await this._backend.keys.generateSymmetrical()
      const encrypt = pify(key.key.encrypt.bind(key.key))
      const html = this._htmlForDoc(await encrypt(doc))

      const files = [
        {
          path: './meta.json',
          content: Buffer.from(JSON.stringify({
            type: this._options.type,
            name: this._backend.crdt.share.name.toString(),
            version
          }, null, '\t'))
        },
        {
          path: './index.html',
          content: html
        }
      ]

      const stream = await pify(this._backend.ipfs.files.createAddStream.bind(this._backend.ipfs.files))()
      let lastNode
      files.forEach((file) => stream.write(file))
      return await new Promise((resolve, reject) => {
        stream.on('error', (err) => reject(err))
        stream.on('data', (node) => {
          if (node.path === '.') {
            resolve({
              key: b58Encode(key.raw),
              hash: node.hash
            })
          }
        })
        stream.end()
      })
    }
  }

  _htmlForDoc (encryptedDoc) {
    const doc = '<!doctype html>\n' +
      renderToString(React.createElement(this._DocViewer, {
        encryptedDoc
      }))
    return Buffer.from(doc)
  }
}

export default Snapshots
