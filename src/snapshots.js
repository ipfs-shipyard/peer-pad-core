'use strict'

const DeltaToHTML = require('quill-delta-to-html')
const pify = require('pify')
const b58Encode = require('bs58').encode
const React = require('react')
const renderToString = require('react-dom/server').renderToString
const Buffer = require('safe-buffer').Buffer
const Remark = require('remark')
const RemarkHtml = require('remark-html')
const RemarkMath = require('remark-math')
const RemarkHtmlKatex = require('remark-html-katex')

const version = require('../package.json').version

let markdown = Remark().use(RemarkHtml)
markdown = pify(markdown.process.bind(markdown))

let markdownMath = Remark()
  .use(RemarkMath)
  .use(RemarkHtmlKatex)
  .use(RemarkHtml)
markdownMath = pify(markdownMath.process.bind(markdownMath))

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
      doc = converter.convert()
    } else {
      doc = this._backend.crdt.share.text.toString()
      if (this._options.type === 'math') {
        doc = (await markdownMath(doc)).contents
      } else if (this._options.type === 'markdown') {
        doc = (await markdown(doc)).contents
      }
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

    const stream = await pify(this._backend.ipfs.files.createAddStream.bind(this._backend.ipfs.files))()
    files.forEach((file) => stream.write(file))
    return new Promise((resolve, reject) => {
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
