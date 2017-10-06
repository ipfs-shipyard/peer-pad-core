'use strict'

const EventEmitter = require('events')

class Document extends EventEmitter {
  constructor (options, backend) {
    super()
    this._options = options
    this._backend = backend
  }

  bindName (input) {
    this._backend.crdt.share.name.bindTextarea(input)
  }

  bindEditor (editor) {
    if (this._options.type === 'richtext') {
      this._backend.crdt.share.richtext.bindQuill(editor)
    } else {
      this._backend.crdt.share.text.bindCodeMirror(editor)
    }
  }

  unbindEditor (editor) {
    if (this._options.type === 'richtext') {
      this._backend.crdt.share.richtext.unbindQuill(editor)
    } else {
      this._backend.crdt.share.text.unbindCodeMirror(editor)
    }
  }
}

export default Document
