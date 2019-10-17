import assert from 'power-assert'
import { useBucket } from '../../src/bucket'

const { get, set, remove, clear } = chrome.storage.local

const name = 'bucket1'
const bucket = useBucket('local', name)
const prefix = `bumble/storage__${name}`
const keysName = `${prefix}_keys`

const pfx = (k) => `${prefix}--${k}`
const unpfx = (pk) => pk.replace(`${prefix}--`, '')

const xfmKeys = (xfm) => (obj) =>
  Object.keys(obj).reduce(
    (r, k) => ({ ...r, [xfm(k)]: obj[k] }),
    {},
  )

const pfxObj = xfmKeys(pfx)
const unpfxObj = xfmKeys(unpfx)

const addKeys = (obj) => ({
  ...obj,
  [keysName]: Object.keys(obj),
})

const x = pfx('x')
const y = pfx('y')
const z = pfx('z')
const a = pfx('a')
const b = pfx('b')

const keys = {
  [keysName]: ['x', 'y'],
}

const values = {
  [x]: '123',
  [y]: '456',
}

beforeEach(() => {
  chrome.reset()
  get.onCall(0).yields(keys)
  get.yields(values)
  set.yields()
  remove.yields()
  clear.yields()
})

test('set with object', async () => {
  const raw = { ...values, [z]: '789' }

  const result = await bucket.set({ z: '789' })

  const expected = unpfxObj(raw)
  expect(result).toEqual(expected)

  assert(get.calledTwice)
  assert(get.calledWith(keysName))
  assert(get.calledWith([x, y]))

  const setter = {
    ...raw,
    'bumble/storage__bucket1_keys': Object.keys(expected),
  }
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  assert(remove.notCalled)
  assert(clear.notCalled)
})

test('set with function', async () => {
  const setFn = ({ x }) => ({ x: x + '4' })
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

  assert(get.calledTwice)
  assert(get.calledWith(keysName))
  assert(get.calledWith([x, y]))

  const setter = {
    ...raw,
    'bumble/storage__bucket1_keys': Object.keys(expected),
  }
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  assert(remove.notCalled)
  assert(clear.notCalled)
})

test('repeated object set operations', async () => {
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

  assert(get.calledTwice)
  assert(get.calledWith(keysName))
  assert(get.calledWith([x, y]))

  const setter = {
    ...raw,
    'bumble/storage__bucket1_keys': Object.keys(expected),
  }
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  assert(remove.notCalled)
  assert(clear.notCalled)
})

test('repeated function set operations', async () => {
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

  assert(get.calledTwice)
  assert(get.calledWith(keysName))
  assert(get.calledWith([x, y]))

  const setter = {
    ...raw,
    'bumble/storage__bucket1_keys': Object.keys(expected),
  }
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  assert(remove.notCalled)
  assert(clear.notCalled)
})

test('mixed set operations', async () => {
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

  assert(get.calledTwice)
  assert(get.calledWith(keysName))
  assert(get.calledWith([x, y]))

  const setter = {
    ...raw,
    'bumble/storage__bucket1_keys': Object.keys(expected),
  }
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  assert(remove.notCalled)
  assert(clear.notCalled)
})

test('rejects if function returns boolean', () => {
  expect.assertions(1)

  const boolean = () => true

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: boolean',
    )
  }

  return bucket.set(boolean).catch(expectError)
})

test('rejects if function returns function', async () => {
  expect.assertions(1)

  const fn = () => () => {}

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: function',
    )
  }

  return bucket.set(fn).catch(expectError)
})

test('rejects if function returns string', async () => {
  expect.assertions(1)

  const string = () => 'string'

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: string',
    )
  }

  return bucket.set(string).catch(expectError)
})

test('rejects if function returns number', async () => {
  expect.assertions(1)

  const number = () => 2

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: number',
    )
  }

  return bucket.set(number).catch(expectError)
})

test('one reject does not disrupt other set ops', async () => {
  const setFn = ({ x }) => ({ x: x + '4' })
  const raw = { [x]: '1234', [y]: values[y] }
  const expected = unpfxObj(raw)

  const spy = jest.fn(setFn)
  const number = jest.fn(() => 2)

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: number',
    )
  }

  const expectResult = (result) => {
    expect(result).toEqual(expected)
  }

  await Promise.all([
    bucket.set(spy).then(expectResult),
    bucket.set(number).catch(expectError),
  ])

  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keysName))
  assert(get.calledWith([x, y]))

  const setter = {
    ...raw,
    'bumble/storage__bucket1_keys': Object.keys(expected),
  }
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({
    x: values[x],
    y: values[y],
  })
})
