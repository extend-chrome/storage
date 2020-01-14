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
  y,
} from './setup'

beforeEach(jest.clearAllMocks)

cases<{
  remover: any
  rawRemover: any
  newKeys: (keyof Bucket)[]
}>(
  'each remover type',
  async ({ remover, rawRemover, newKeys }) => {
    const bucket = useBucket<Bucket>('local', bucketName)

    await bucket.remove(remover)

    expect(remove).toBeCalledTimes(1)
    expect(remove).toBeCalledWith(rawRemover, anyFn)

    expect(get).toBeCalledTimes(1)
    expect(get).toBeCalledWith(keysName, anyFn)

    expect(set).toBeCalledTimes(1)
    expect(set).toBeCalledWith(
      {
        [keysName]: newKeys,
      },
      anyFn,
    )

    expect(clear).not.toBeCalled()
  },
  {
    string: {
      remover: 'x',
      rawRemover: [x],
      newKeys: ['y'],
    },
    array: {
      remover: ['y', 'z'],
      rawRemover: [y, z],
      newKeys: ['x'],
    },
  },
)

cases<{ remover: any; type: any }>(
  'each invalid remover type',
  async ({ remover, type }) => {
    const bucket = useBucket<Bucket>('local', bucketName)

    expect(() => bucket.remove(remover)).toThrow(
      new TypeError(`Unexpected argument type: ${type}`),
    )
  },
  {
    number: { remover: 123, type: 'number' },
    boolean: { remover: true, type: 'boolean' },
    mixedArray: { remover: ['a', 1], type: 'number' },
  },
)
