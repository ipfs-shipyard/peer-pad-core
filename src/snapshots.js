'use strict'

const DeltaToHTML = require('quill-delta-to-html')
const pify = require('pify')
const b58Encode = require('bs58').encode
const React = require('react')
const renderToString = require('react-dom/server').renderToString

const version = require('../package.json').version

class Snapshots {
  constructor (options, backend, document) {
    this._options = options
    this._DocViewer = this._options.docViewer
    this._backend = backend
    this._document = document
  }

  async take () {
    console.log('take')
    let doc
    if (this._options.type === 'richtext') {
      const delta = this._backend.crdt.share.richtext.toDelta()
      const converter = new DeltaToHTML(delta, {})
      doc = converter.convert()
    } else {
      doc = this._backend.crdt.share.text.toString()
      doc = await this._document.convertMarkdown(doc, this._options.type)
    }
    doc = Buffer.from(doc)

    const key = await this._backend.keys.generateSymmetrical()
    const encrypt = pify(key.key.encrypt.bind(key.key))
    const html = this._htmlForDoc(await encrypt(doc), this._options.docScript)

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

    const stream = this._backend.ipfs.files.addReadableStream()
    return new Promise((resolve, reject) => {
      stream.once('error', (err) => reject(err))
      stream.on('data', (node) => {
        if (node.path === '.') {
          resolve({
            key: b58Encode(key.raw),
            hash: node.hash
          })
        }
      })
      files.forEach((file) => stream.write(file))
      stream.end()
    })
  }

  _htmlForDoc (encryptedDoc, docScript) {
    const doc = '<!doctype html>\n' +
      renderToString(React.createElement(this._DocViewer, {
        encryptedDoc,
        docScript
      }))
    return Buffer.from(doc)
  }
}

module.exports = Snapshots
