'use strict'

import { Buffer } from 'safe-buffer'
import DeltaToHTML from 'quill-delta-to-html'
import pify from 'pify'
import { encode as b58Encode } from 'bs58'
import React from 'react'
import { renderToString } from 'react-dom/server'

class Snapshots {
  constructor (options, backend) {
    this._options = options
    this._DocViewer = this._options.docViewer
    this._DocViewerScript = this._options.docViewerScript
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
      return await this._backend.ipfs.files.add(html).then((results) => (
        {
          key: b58Encode(key.raw),
          hash: results[results.length - 1].hash
        }))
    }
  }

  _htmlForDoc (encryptedDoc) {
    const doc = '<!doctype html>\n' +
      renderToString(React.createElement(this._DocViewer, {
        encryptedDoc,
        script: this._DocViewerScript
      }))
    return Buffer.from(doc)
  }
}

export default Snapshots
