import cases from 'jest-in-case'
import { getBucket } from '../../src/bucket'
import {
  anyFn,
  Bucket,
  bucketName,
  clear,
  get,
  keysName,
  remove,
  set,
  z,
} from './setup'

beforeEach(() => {
  jest.clearAllMocks()
  get.mockImplementation((getter, cb) => {
    cb({})
  })
})

cases<{
  setter: any
  setterFn?: any
  rawSetter: any
}>(
  'each setter type',
  async ({ setter, setterFn, rawSetter }) => {
    const bucket = getBucket<Bucket>(bucketName)
    const result = await bucket.set(setterFn || setter)

    expect(remove).not.toBeCalled()
    expect(clear).not.toBeCalled()

    expect(get).toBeCalledTimes(1)
    expect(get).toBeCalledWith(keysName, anyFn)

    expect(set).toBeCalledTimes(1)
    expect(set).toBeCalledWith(rawSetter, anyFn)

    expect(result).toEqual(setter)
  },
  {
    object: {
      setter: { z: '789' },
      rawSetter: {
        [z]: '789',
        [keysName]: ['z'],
      },
    },
    function: {
      setter: { z: '789' },
      setterFn: jest.fn(() => ({ z: '789' })),
      rawSetter: {
        [z]: '789',
        [keysName]: ['z'],
      },
    },
  },
)
