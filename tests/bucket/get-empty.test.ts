import cases from 'jest-in-case'
import { useBucket } from '../../src/bucket'
import {
  anyFn,
  Bucket,
  bucketName,
  clear,
  get,
  keysName,
  remove,
  set,
  x,
  z,
} from './setup'

beforeEach(jest.clearAllMocks)

cases<{
  getter: any
  rawGetter: any
  expected: any
}>(
  'each getter type with empty storage',
  async ({ getter, rawGetter, expected }) => {
    get.mockImplementation((getter, cb) => {
      if (typeof getter === 'object' && !Array.isArray(getter)) {
        cb(getter)
      } else {
        cb({})
      }
    })

    const bucket = useBucket<Bucket>('local', bucketName)
    const result = await bucket.get(getter)

    expect(result).toEqual(expected)

    expect(set).not.toBeCalled()
    expect(remove).not.toBeCalled()
    expect(clear).not.toBeCalled()

    expect(get).toBeCalledTimes(1)
    expect(get).toBeCalledWith(rawGetter, anyFn)
  },
  {
    string: {
      getter: 'x',
      rawGetter: x,
      expected: {},
    },
    object: {
      getter: { x: 'abc', z: '789' },
      rawGetter: { [x]: 'abc', [z]: '789' },
      expected: { x: 'abc', z: '789' },
    },
    array: {
      getter: ['x', 'z'],
      rawGetter: [x, z],
      expected: {},
    },
    function: {
      getter: ({ x }: Bucket) => typeof x,
      rawGetter: keysName,
      expected: 'undefined',
    },
    undefined: {
      getter: undefined,
      rawGetter: keysName,
      expected: {},
    },
    null: {
      getter: null,
      rawGetter: keysName,
      expected: {},
    },
  },
)
