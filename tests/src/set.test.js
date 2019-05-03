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

test('throws with unexpected argument type', async () => {
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

test('throws with unexpected function return type', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  const number = () => 2
  const string = () => 'a'
  const boolean = () => true
  const fn = () => () => {}

  await expect(storage.local.set(number)).rejects.toThrow(
    new TypeError('Setter must return an object or undefined.'),
  )

  await expect(storage.local.set(string)).rejects.toThrow(
    new TypeError('Setter must return an object or undefined.'),
  )

  await expect(storage.local.set(boolean)).rejects.toThrow(
    new TypeError('Setter must return an object or undefined.'),
  )

  await expect(storage.local.set(fn)).rejects.toThrow(
    new TypeError('Setter must return an object or undefined.'),
  )
})
