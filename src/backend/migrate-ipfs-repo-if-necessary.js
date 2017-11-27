'use strict'

module.exports = () => {
  return new Promise((resolve, reject) => {
    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    var open = indexedDB.open('ipfs');
    open.onerror = reject
    open.onsuccess = () => {
      const db = open.result
      const stores = db.objectStoreNames
      if (!stores.contains('ipfs')) {
        // no IPFS db, no need to upgrade
        return resolve()
      }
      const tx = db.transaction('ipfs', 'readwrite');
      const store = tx.objectStore('ipfs');
      const get = store.get('/version')
      get.onerror = reject
      get.onsuccess = () => {
        if (!get.result) {
          return resolve()
        }
        const version = Number(Buffer.from(get.result).toString())
        if (version === 5) {
          console.log('saving new version')
          const put = store.put(new Buffer('6'), '/version')
          put.onerror = reject
          put.onsuccess = () => resolve()
        } else {
          resolve()
        }
      }

      tx.oncomplete = () => db.close()
    }
  })
}
