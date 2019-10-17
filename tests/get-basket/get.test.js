import assert from 'power-assert'
import { useBucket } from '../../src/get-bucket'

const { get, set, remove, clear } = chrome.storage.local

const name = 'bucket1'
const bucket = useBucket('local', name)
const prefix = `bumble/storage__${name}`

const keys = `${prefix}_keys`
const x = `${prefix}--x`
const y = `${prefix}--y`
const z = `${prefix}--z`

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

test('get with string', async () => {
  const getter = 'x'
  const expected = { x: '123' }

  const got = { [x]: values[x] }
  get.yields(got)

  const result = await bucket.get(getter)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(x))

  expect(result).toEqual(expected)
})

test('get with object', async () => {
  const getter = { x: 'abc', z: '789' }
  const rawGetter = { [x]: 'abc', [z]: '789' }
  const expected = { x: '123', z: '789' }

  const got = { [x]: values[x], [z]: getter.z }
  get.yields(got)

  const result = await bucket.get(getter)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))

  expect(result).toEqual(expected)
})

test('get with array', async () => {
  const getter = ['x', 'z']
  const rawGetter = [x, z]
  const expected = { x: values[x], y: values[y] }

  const got = { [x]: values[x], [y]: values[y] }
  get.yields(got)

  const result = await bucket.get(getter)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))

  expect(result).toEqual(expected)
})

test('get with function', async () => {
  const getter = ({ x }) => x + 4
  const spy = jest.fn(getter)

  get.onCall(0).yields({ [keys]: values[keys] })
  get.onCall(1).yields({ [x]: values[x], [y]: values[y] })

  const result = await bucket.get(spy)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({
    x: values[x],
    y: values[y],
  })

  expect(result).toEqual('1234')
})

test('get with undefined', async () => {
  get.onCall(0).yields({ [keys]: values[keys] })
  get.onCall(1).yields({ [x]: values[x], [y]: values[y] })

  const result = await bucket.get()
  const expected = {
    x: values[x],
    y: values[y],
  }

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  expect(result).toEqual(expected)
})

test('get with null', async () => {
  get.onCall(0).yields({ [keys]: values[keys] })
  get.onCall(1).yields({ [x]: values[x], [y]: values[y] })

  const result = await bucket.get(null)
  const expected = {
    x: values[x],
    y: values[y],
  }

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  expect(result).toEqual(expected)
})

test('throws with unexpected args', async () => {
  const withNum = () => bucket.get(2)
  const withBool = () => bucket.get(true)

  expect(withNum).toThrow(
    new TypeError('Unexpected argument type: number'),
  )

  expect(withBool).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )
})

test('get from empty storage with string', async () => {
  get.yields({})

  const getter = 'x'

  const result = await bucket.get(getter)

  const expected = {}
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(x))
})

test('get from empty storage with object', async () => {
  const getter = { x: 'abc', z: '789' }
  const rawGetter = { [x]: getter.x, [z]: getter.z }

  get.yields(rawGetter)

  const result = await bucket.get(getter)

  const expected = getter
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))
})

test('get from empty storage with array', async () => {
  get.yields({})

  const getter = ['x', 'z']
  const rawGetter = [x, z]

  const result = await bucket.get(getter)

  const expected = {}
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))
})

test('get from empty storage with function', async () => {
  get.yields({})

  const getter = ({ x = '123' }) => x + 4
  const spy = jest.fn(getter)

  const result = await bucket.get(spy)

  const expected = '1234'
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({})
})

test('get from empty storage with undefined', async () => {
  get.yields({})

  const result = await bucket.get()
  const expected = {}

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  expect(result).toEqual(expected)
})

test('get from empty storage with null', async () => {
  get.yields({})

  const result = await bucket.get(null)
  const expected = {}

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  expect(result).toEqual(expected)
})
