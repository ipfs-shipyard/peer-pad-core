# peerpad-core

[![made by Protocol Labs](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.io)
[![Freenode](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

Peerpad core API

## Install

```bash
$ npm install peerpad-core --save
```

## Import

```js
import PeerpadBackend from 'peerpad-core'
```

## `PeerpadBackend.generateRandomKeys()`

Generates a set of read and write random keys.

Returns a promise that resolves to:

```js
{
  "read": "base58-encoded string",
  "write": "base58-encoded string",
}
```


## `PeerpadBackend(options)`

Creates a Peerpad backend.

```js
const backend = PeerpadBackend(options)
```

Options:

* `ipfs`: IPFS node that is already created (optional)

# `PeerpadBackend`

## `backend.ipfs`

The IPFS node.

## `async backend.start()`

Starts the backend. Returns a promise that resolves once the backend has started.

## `async backend.stop()`

Stops the backend.

## Network: `backend.network`

### `backend.network.once('started', fn)`

Emitted once the IPFS node starts. If you passed in an IPFS node that is already started (via `options.ipfs`), this event doesn't get emitted.

## `backend.createDocument(options)`

```js
const options = {
  name: 'name of the pad',
  type: 'richtext',
  readKey: 'gobelegook',
  writeKey: 'moregobelegook'
}

const document = backend.createDocument(options)
```

## `options`:

* `name`: string that uniquely identifies this
* `type`: string that identifies type of document. Currently supports `text` or `richtext`.
* `readKey`: string containing the read key
* `writeKey`: string containing the write key (optional)

# `Document`

## Peers: `document.peers`

### `document.peers.all()`

Returns an array of peers:

```js
document.peers.all()
// returns:
[
  {
    id: 'QmHashHash1',
    permissions: {
      admin: false,
      write: true,
      read: true
    }
  },
  {
    id: 'QmHashHash2',
    permissions: {
      admin: false,
      write: false,
      read: true
    }
  }
]
```

### `document.peers.on('change', fn)`

Emitted when there is a change in the peer list:

```js
document.peers.on('change', () => {
  console.log('peers changed and now are', peerpad.peers.all())
})
```

## `document.bindEditor(editor)`

Bind [CodeMirror](https://codemirror.net) editor (for pad of type `markdown` or `text`) or [Quill](https://quilljs.com) editor (for pad of type `richtext`).

Two-way bind to a  editor. Example for Quill:

```js
import Quill from 'quill'

const editor = new Quill('#editor')

document.bindEditor(editor)
```

Example for CodeMirror:

```js
import Codemirror from 'codemirror'

const editor = CodeMirror.fromTextArea(myTextArea)

document.bindEditor(editor)
```

### `document.unbindEditor(editor)`

Unbinds editor.

### `document.on('change', fn)`

Emitted when the document changes. `fn` is called with the arguments:

* `peer` (a Peer object)
* `operation` (object of type Operation, see further down)


## `document.snapshots`

## `document.snapshots.take()`

Returns a promise

```js
peerpad.snapshots.take().then((hash) => {
  console.log('snapshot hash: ', hash)
})
```

### Want to hack on Peerpad?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

# License

MIT