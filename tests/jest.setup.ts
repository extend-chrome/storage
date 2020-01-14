const makeStorageArea = () => ({
  clear: jest.fn((cb: Function) => {
    cb()
  }),
  get: jest.fn((getter: any, cb: Function) => {
    cb()
  }),
  getBytesInUse: jest.fn((cb: Function) => {
    cb()
  }),
  remove: jest.fn((keys: any, cb: Function) => {
    cb()
  }),
  set: jest.fn((setter: any, cb: Function) => {
    cb()
  }),
})

Object.assign(global, {
  chrome: {
    storage: {
      local: makeStorageArea(),
      sync: makeStorageArea(),
      managed: makeStorageArea(),
    },
    runtime: {},
  },
})

// Jest's jsdom does not include window.crypto
const nodeCrypto = require('crypto')
Object.assign(global, {
  crypto: {
    getRandomValues: function(buffer: Uint8Array) {
      return nodeCrypto.randomFillSync(buffer)
    },
  },
})
