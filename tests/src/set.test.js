import assert from 'power-assert'
import { storage } from '../../src/index'

const { get, set } = chrome.storage.local

beforeEach(() => {
  chrome.reset()
})

test('set with object', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  const result = await storage.local.set({ z: '789' })

  expect(result).toBeUndefined()

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.calledOnce)
})

test('set with function', async () => {
  const values = { x: '123', y: '456' }
  get.yields({ storage: values })
  set.yields()

  const spy = jest.fn(({ x }) => {
    const newX = x + '4'
    return { x: newX }
  })

  const result = await storage.local.set(spy)

  expect(result).toBeUndefined()

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith(values)

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.calledOnce)
  assert(
    set.withArgs({ storage: { x: '1234', y: '456' } })
      .calledOnce,
  )
})

test('repeated object set operations', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  await Promise.all([
    storage.local.set({ z: '789' }),
    storage.local.set({ a: '000' }),
  ])

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.calledOnce)
  assert(
    set.withArgs({
      storage: { x: '123', y: '456', z: '789', a: '000' },
    }).calledOnce,
  )
})

test('repeated function set operations', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  await Promise.all([
    storage.local.set(() => ({ x: '789' })),
    storage.local.set(({ x }) => ({ a: x + '0' })),
    storage.local.set(({ y }) => ({ b: y })),
  ])

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  const final = { x: '789', y: '456', a: '7890', b: '456' }
  assert(set.calledOnce)
  assert(set.withArgs({ storage: final }).calledOnce)
})

test('mixed set operations', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  await Promise.all([
    storage.local.set({ z: '789' }),
    storage.local.set(({ z }) => ({ z: z + 0 })),
  ])

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.calledOnce)
  assert(
    set.withArgs({
      storage: { x: '123', y: '456', z: '7890' },
    }).calledOnce,
  )
})

test('rejects with unexpected argument type', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  await expect(storage.local.set(2)).rejects.toThrow(
    new TypeError('Setter must be an object or a function.'),
  )
  await expect(storage.local.set('b')).rejects.toThrow(
    new TypeError('Setter must be an object or a function.'),
  )
  await expect(storage.local.set(true)).rejects.toThrow(
    new TypeError('Setter must be an object or a function.'),
  )
})

test('rejects if function returns boolean', async () => {
  expect.assertions(1)

  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  const boolean = () => true

  const expectError = (error) => {
    expect(error.message).toBe(
      'Setter must return an object or undefined.',
    )
  }

  return storage.local.set(boolean).catch(expectError)
})

test('rejects if function returns function', async () => {
  expect.assertions(1)

  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  const fn = () => () => {}

  const expectError = (error) => {
    expect(error.message).toBe(
      'Setter must return an object or undefined.',
    )
  }

  return storage.local.set(fn).catch(expectError)
})

test('rejects if function returns string', async () => {
  expect.assertions(1)

  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  const string = () => 'string'

  const expectError = (error) => {
    expect(error.message).toBe(
      'Setter must return an object or undefined.',
    )
  }

  return storage.local.set(string).catch(expectError)
})

test('rejects if function returns number', async () => {
  expect.assertions(1)

  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  const number = () => 2

  const expectError = (error) => {
    expect(error.message).toBe(
      'Setter must return an object or undefined.',
    )
  }

  return storage.local.set(number).catch(expectError)
})

test.todo('one reject does not disrupt other set ops')
