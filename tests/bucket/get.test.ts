import cases from 'jest-in-case'
import { getBucket } from '../../src/bucket'
import {
  anyFn,
  Bucket,
  bucketName,
  clear,
  get,
  keys,
  keysName,
  remove,
  set,
  values,
  x,
  y,
  z,
} from './setup'

beforeEach(jest.clearAllMocks)

cases<{
  getter: any
  rawGetter: any
  got: any
  calls: number
  expected: any
}>(
  'each getter type',
  async ({ getter, rawGetter, got, calls, expected }) => {
    const bucket = getBucket<Bucket>(bucketName)

    get.mockImplementation((getter, cb) => {
      if (getter === keysName) {
        cb(keys)
      } else {
        cb(got)
      }
    })

    const result = await bucket.get(getter)

    expect(set).not.toBeCalled()
    expect(remove).not.toBeCalled()
    expect(clear).not.toBeCalled()

    expect(get).toBeCalledTimes(calls)
    expect(get).toBeCalledWith(rawGetter, anyFn)

    expect(result).toEqual(expected)
  },
  {
    string: {
      getter: 'x',
      rawGetter: x,
      got: { [x]: values[x] },
      calls: 1,
      expected: { x: values[x] },
    },
    object: {
      getter: { x: 'abc', z: '789' },
      rawGetter: { [x]: 'abc', [z]: '789' },
      got: { [x]: values[x], [z]: '789' },
      calls: 1,
      expected: { x: values[x], z: '789' },
    },
    array: {
      getter: ['x', 'z'],
      rawGetter: [x, z],
      got: { [x]: values[x] },
      calls: 1,
      expected: { x: values[x] },
    },
    function: {
      getter: ({ x }: Bucket) => typeof x,
      rawGetter: [x, y],
      got: values,
      calls: 2,
      expected: 'string',
    },
    undefined: {
      getter: undefined,
      rawGetter: [x, y],
      got: values,
      calls: 2,
      expected: { x: values[x], y: values[y] },
    },
    null: {
      getter: null,
      rawGetter: [x, y],
      got: values,
      calls: 2,
      expected: { x: values[x], y: values[y] },
    },
  },
)
