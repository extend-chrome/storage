import assert from 'power-assert'
import { getBasket } from '../../src'

const { get, set, remove, clear } = chrome.storage.local

const name = 'basket1'
const basket = getBasket('local', name)
const prefix = `bumble/storage__${name}`

const keys = `${prefix}_keys`
const x = `${prefix}--x`
const y = `${prefix}--y`

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

test('remove with string', async () => {
  const arg = 'x'

  await basket.remove(arg)

  assert(get.notCalled)
  assert(set.notCalled)
  assert(clear.notCalled)

  assert(remove.calledOnce())
  assert(remove.calledWith(x))
})

test('remove with array', async () => {
  const arg = ['x', 'z']
  const z = `${prefix}--z`

  await basket.remove(arg)

  assert(get.notCalled)
  assert(set.notCalled)
  assert(clear.notCalled)

  assert(remove.calledOnceWith([x, z]))
})

test('throws with unexpected args', async () => {
  const withNum = () => basket.remove(2)
  const withBool = () => basket.remove(true)
  const withMixedArray = () => basket.remove(['a', true])

  expect(withNum).toThrow(
    new TypeError('Unexpected argument type: number'),
  )

  expect(withBool).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )

  expect(withMixedArray).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )
})
