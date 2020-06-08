export const bucketName = 'bucket1'
export const prefix = `extend-chrome/storage__${bucketName}`
export const keysName = `${prefix}_keys`

export const pfx = (k: string) => `${prefix}--${k}`
export const unpfx = (pk: string) =>
  pk.replace(`${prefix}--`, '')

export const xfmKeys = (xfm: (x: string) => string) => (obj: {
  [key: string]: any
}): {
  [key: string]: any
} => {
  return Object.keys(obj).reduce(
    (r, k) => ({
      ...r,
      [xfm(k)]: obj[k],
    }),
    {},
  )
}

export const unpfxObj = xfmKeys(unpfx)

export interface Bucket {
  x: string
  y: string
  z: string
  a: string
  b: string
}

export const x = pfx('x')
export const y = pfx('y')
export const z = pfx('z')
export const a = pfx('a')
export const b = pfx('b')

export const keys = {
  [keysName]: ['x', 'y'],
}

export const values = {
  [x]: '123',
  [y]: '456',
}

// eslint-disable-next-line
// @ts-ignore
export const { get, set, remove, clear } = chrome.storage
  .local as {
  clear: jest.Mock<void, [Function]>
  get: jest.Mock<void, [any, Function]>
  getBytesInUse: jest.Mock<void, [Function]>
  remove: jest.Mock<void, [any, Function]>
  set: jest.Mock<void, [any, Function]>
}

get.mockImplementation((getter, cb) => {
  if (getter === keysName) {
    cb(keys)
  } else {
    cb(values)
  }
})

export const anyFn = expect.any(Function)
