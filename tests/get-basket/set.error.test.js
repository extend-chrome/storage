import assert from 'power-assert'
import { getBasket } from '../../src/get-basket'

const { get, set, remove, clear } = chrome.storage.local

const name = 'basket1'
const basket = getBasket('local', name)
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
    basket.set(spy).then(expectResult),
    basket.set(number).catch(expectError),
  ])

  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keysName))
  assert(get.calledWith([x, y]))

  const setter = pfxObj(addKeys(expected))
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({
    x: values[x],
    y: values[y],
  })
})