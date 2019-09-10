import assert from 'power-assert'
import { storage } from '../../src/get-basket'

const { get, set, remove, clear } = chrome.storage.local
const values = { x: '123', y: '456' }

beforeEach(() => {
  chrome.reset()
  get.yields(values)
  set.yields()
  remove.yields()
  clear.yields()
})

test('set with object', async () => {
  const expected = { x: '123', y: '456', z: '789' }

  const result = await storage.local.set({ z: '789' })

  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  assert(set.calledOnce)
  assert(set.withArgs(expected).calledOnce)

  expect(result).toEqual(expected)
})

test('set with function', async () => {
  const spy = jest.fn(({ x }) => {
    const newX = x + '4'
    return { x: newX }
  })

  const expected = { x: '1234', y: '456' }
  const result = await storage.local.set(spy)

  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  assert(set.calledOnce)
  assert(set.withArgs(expected).calledOnce)

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith(values)

  expect(result).toEqual(expected)
})

test('repeated object set operations', async () => {
  const expected = { x: '123', y: '456', z: '789', a: '000' }

  const results = await Promise.all([
    storage.local.set({ z: '789' }),
    storage.local.set({ a: '000' }),
  ])

  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  assert(set.calledOnce)
  assert(set.withArgs(expected).calledOnce)

  results.forEach((result) => {
    expect(result).toEqual(expected)
  })
})

test('repeated function set operations', async () => {
  const expected = { x: '789', y: '456', a: '7890', b: '456' }

  const results = await Promise.all([
    storage.local.set(() => ({ x: '789' })),
    storage.local.set(({ x }) => ({ a: x + '0' })),
    storage.local.set(({ y }) => ({ b: y })),
  ])

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  assert(set.calledOnce)
  assert(set.withArgs(expected).calledOnce)

  results.forEach((result) => {
    expect(result).toEqual(expected)
  })
})

test('mixed set operations', async () => {
  const expected = { x: '123', y: '456', z: '7890' }

  const results = await Promise.all([
    storage.local.set({ z: '789' }),
    storage.local.set(({ z }) => ({ z: z + 0 })),
  ])

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  assert(set.calledOnce)
  assert(set.withArgs(expected).calledOnce)

  results.forEach((result) => {
    expect(result).toEqual(expected)
  })
})

test('throws with unexpected args', async () => {
  const withNum = () => storage.local.set(2)
  const withBool = () => storage.local.set(true)
  const withMixedArray = () => storage.local.set(['a', true])

  expect(withNum).toThrow(
    new TypeError('Unexpected argument type: number'),
  )

  expect(withBool).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )

  expect(withMixedArray).toThrow(
    new TypeError('Unexpected argument type: Array'),
  )
})

test('rejects if function returns boolean', () => {
  expect.assertions(1)

  const boolean = () => true

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: boolean',
    )
  }

  return storage.local.set(boolean).catch(expectError)
})

test('rejects if function returns function', async () => {
  expect.assertions(1)

  const fn = () => () => {}

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: function',
    )
  }

  return storage.local.set(fn).catch(expectError)
})

test('rejects if function returns string', async () => {
  expect.assertions(1)

  const string = () => 'string'

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: string',
    )
  }

  return storage.local.set(string).catch(expectError)
})

test('rejects if function returns number', async () => {
  expect.assertions(1)

  const number = () => 2

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: number',
    )
  }

  return storage.local.set(number).catch(expectError)
})

test.todo('one reject does not disrupt other set ops')
