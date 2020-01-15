import { getBucket } from '../../src/bucket'
import {
  a,
  b,
  bucketName,
  clear,
  get,
  keysName,
  remove,
  set,
  unpfxObj,
  values,
  x,
  y,
  z,
  Bucket,
} from './setup'

beforeEach(jest.clearAllMocks)

test('set with object', async () => {
  const bucket = getBucket<Bucket>(bucketName)

  const raw = { ...values, [z]: '789' }

  const result = await bucket.set({ z: '789' })

  const expected = unpfxObj(raw)
  expect(result).toEqual(expected)

  expect(get).toBeCalledTimes(2)
  expect(get).toBeCalledWith(keysName, expect.any(Function))
  expect(get).toBeCalledWith([x, y], expect.any(Function))

  const setter = {
    ...raw,
    [keysName]: Object.keys(expected),
  }

  expect(set).toBeCalledTimes(1)
  expect(set).toBeCalledWith(setter, expect.any(Function))

  expect(remove).not.toBeCalled()
  expect(clear).not.toBeCalled()
})

test('set with function', async () => {
  const bucket = getBucket<Bucket>(bucketName)

  const setFn = ({ x }: Bucket) => ({ x: x + '4' })
  const spy = jest.fn(setFn)

  const raw = { [x]: '1234', [y]: '456' }
  const result = await bucket.set(spy)

  const expected = unpfxObj(raw)
  expect(result).toEqual(expected)

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({
    x: values[x],
    y: values[y],
  })

  expect(get).toBeCalledTimes(2)
  expect(get).toBeCalledWith(keysName, expect.any(Function))
  expect(get).toBeCalledWith([x, y], expect.any(Function))

  const setter = {
    ...raw,
    [keysName]: Object.keys(expected),
  }
  expect(set).toBeCalledTimes(1)
  expect(set).toBeCalledWith(setter, expect.any(Function))

  expect(remove).not.toBeCalled()
  expect(clear).not.toBeCalled()
})

test('repeated object set operations', async () => {
  const bucket = getBucket<Bucket>(bucketName)

  const raw = {
    [x]: values[x],
    [y]: values[y],
    [z]: '789',
    [a]: '000',
  }

  const results = await Promise.all([
    bucket.set({ z: '789' }),
    bucket.set({ a: '000' }),
  ])

  const expected = unpfxObj(raw)
  results.forEach((result) => {
    expect(result).toEqual(expected)
  })

  expect(get).toBeCalledTimes(2)
  expect(get).toBeCalledWith(keysName, expect.any(Function))
  expect(get).toBeCalledWith([x, y], expect.any(Function))

  const setter = {
    ...raw,
    [keysName]: Object.keys(expected),
  }
  expect(set).toBeCalledTimes(1)
  expect(set).toBeCalledWith(setter, expect.any(Function))

  expect(remove).not.toBeCalled()
  expect(clear).not.toBeCalled()
})

test('repeated function set operations', async () => {
  const bucket = getBucket<Bucket>(bucketName)

  const raw = { [x]: '789', [y]: '456', [a]: '7890', [b]: '456' }

  const results = await Promise.all([
    bucket.set(() => ({ x: '789' })),
    bucket.set(({ x }) => ({ a: x + '0' })),
    bucket.set(({ y }) => ({ b: y })),
  ])

  const expected = unpfxObj(raw)
  results.forEach((result) => {
    expect(result).toEqual(expected)
  })

  expect(get).toBeCalledTimes(2)
  expect(get).toBeCalledWith(keysName, expect.any(Function))
  expect(get).toBeCalledWith([x, y], expect.any(Function))

  const setter = {
    ...raw,
    [keysName]: Object.keys(expected),
  }
  expect(set).toBeCalledTimes(1)
  expect(set).toBeCalledWith(setter, expect.any(Function))

  expect(remove).not.toBeCalled()
  expect(clear).not.toBeCalled()
})

test('mixed set operations', async () => {
  const bucket = getBucket<Bucket>(bucketName)

  const raw = { [x]: '123', [y]: '456', [z]: '7890', [a]: '000' }

  const results = await Promise.all([
    bucket.set({ z: '789' }),
    bucket.set(({ z }) => ({ z: z + 0 })),
    bucket.set({ a: '000' }),
  ])

  const expected = unpfxObj(raw)
  results.forEach((result) => {
    expect(result).toEqual(expected)
  })

  expect(get).toBeCalledTimes(2)
  expect(get).toBeCalledWith(keysName, expect.any(Function))
  expect(get).toBeCalledWith([x, y], expect.any(Function))

  const setter = {
    ...raw,
    [keysName]: Object.keys(expected),
  }
  expect(set).toBeCalledTimes(1)
  expect(set).toBeCalledWith(setter, expect.any(Function))

  expect(remove).not.toBeCalled()
  expect(clear).not.toBeCalled()
})
