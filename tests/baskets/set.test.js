import assert from 'power-assert'
import { getBasket } from '../../src'

const { get, set, remove, clear } = chrome.storage.local

const name = 'basket1'
const basket = getBasket('local', name)
const prefix = `bumble/storage__${name}`
const pfixKey = (k) => `${prefix}--${k}`

const keys = `${prefix}_keys`
const x = pfixKey(x)
const y = pfixKey(y)
const z = pfixKey(z)
const a = pfixKey(a)
const b = pfixKey(b)

const values = {
  [keys]: ['x', 'y'],
  [x]: '123',
  [y]: '456',
}

beforeEach(() => {
  chrome.reset()
  get.yields(values)
  set.yields()
  remove.yields()
  clear.yields()
})

test('set with object', async () => {
  const raw = { [x]: '123', [y]: '456', [z]: '789' }
  const expected = { x: '123', y: '456', z: '789' }

  const result = await basket.set({ z: '789' })

  assert(get.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(set.calledOnce)
  assert(set.calledWith(raw))

  expect(result).toEqual(expected)
})

test('set with function', async () => {
  const setter = ({ x }) => ({ x: x + '4' })
  const spy = jest.fn(setter)

  const raw = { [x]: '1234', [y]: '456' }
  const expected = { x: '1234', y: '456' }
  const result = await basket.set(spy)

  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  assert(set.calledOnce)
  assert(set.calledWith(raw))

  expect(result).toEqual(expected)

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({
    x: values[x],
    y: values[y],
  })
})

test('repeated object set operations', async () => {
  const raw = { [x]: '123', [y]: '456', [z]: '789', [a]: '000' }
  const expected = { x: '123', y: '456', z: '789', a: '000' }

  const results = await Promise.all([
    basket.set({ z: '789' }),
    basket.set({ a: '000' }),
  ])

  assert(get.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(set.calledOnce)
  assert(set.calledWith(raw))

  results.forEach((result) => {
    expect(result).toEqual(expected)
  })
})

test('repeated function set operations', async () => {
  const raw = { [x]: '789', [y]: '456', [a]: '7890', [b]: '456' }
  const expected = { x: '789', y: '456', a: '7890', b: '456' }

  const results = await Promise.all([
    basket.set(() => ({ x: '789' })),
    basket.set(({ x }) => ({ a: x + '0' })),
    basket.set(({ y }) => ({ b: y })),
  ])

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  assert(set.calledOnce)
  assert(set.calledWith(raw))

  results.forEach((result) => {
    expect(result).toEqual(expected)
  })
})

test('mixed set operations', async () => {
  const raw = { [x]: '123', [y]: '456', [z]: '7890' }
  const expected = { x: '123', y: '456', z: '7890' }

  const results = await Promise.all([
    basket.set({ z: '789' }),
    basket.set(({ z }) => ({ z: z + 0 })),
  ])

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  assert(set.calledOnce)
  assert(set.calledWith(raw))

  results.forEach((result) => {
    expect(result).toEqual(expected)
  })
})

test('throws with unexpected args', async () => {
  const withNum = () => basket.set(2)
  const withBool = () => basket.set(true)
  const withMixedArray = () => basket.set(['a', true])

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

  return basket.set(boolean).catch(expectError)
})

test('rejects if function returns function', async () => {
  expect.assertions(1)

  const fn = () => () => {}

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: function',
    )
  }

  return basket.set(fn).catch(expectError)
})

test('rejects if function returns string', async () => {
  expect.assertions(1)

  const string = () => 'string'

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: string',
    )
  }

  return basket.set(string).catch(expectError)
})

test('rejects if function returns number', async () => {
  expect.assertions(1)

  const number = () => 2

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: number',
    )
  }

  return basket.set(number).catch(expectError)
})

test('one reject does not disrupt other set ops', async () => {
  expect.assertions(3)

  const setter = ({ x }) => ({ x: x + '4' })
  const rawSet = { [x]: '1234' }
  const expected = { x: '1234', y: '456' }

  const spy = jest.fn(setter)
  const number = jest.fn(() => 2)

  const expectError = (error) => {
    expect(error.message).toBe(
      'Unexpected setter return value: number',
    )
  }

  const expectResult = (result) => {
    expect(result).toEqual(expected)
  }

  const shouldReject = basket.set(number).catch(expectError)
  const shouldResolve = basket.set(spy).then(expectResult)

  const [result] = await Promise.all([
    shouldResolve,
    shouldReject,
  ])

  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  assert(set.calledOnce)
  assert(set.calledWith(rawSet))

  expect(result).toEqual(expected)

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({
    x: values[x],
    y: values[y],
  })
})
