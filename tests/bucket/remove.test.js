import assert from 'power-assert'
import { useBucket } from '../../src/bucket'
import chrome from 'sinon-chrome'

const { get, set, remove, clear } = chrome.storage.local

const name = 'bucket1'
const bucket = useBucket('local', name)
const prefix = `bumble/storage__${name}`

const pfx = (k) => `${prefix}--${k}`

const keys = `${prefix}_keys`

const x = pfx('x')
const y = pfx('y')
const z = pfx('z')

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

  await bucket.remove(arg)

  assert(remove.calledOnce)
  assert(remove.calledWith([x]))

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  assert(set.calledOnce)
  assert(
    set.calledWith({
      [keys]: ['y'],
    }),
  )

  assert(clear.notCalled)
})

test('remove with array', async () => {
  const arg = ['y', 'z']

  await bucket.remove(arg)

  assert(remove.calledOnce)
  assert(remove.calledWith([y, z]))

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  assert(set.calledOnce)
  assert(
    set.calledWith({
      [keys]: ['x'],
    }),
  )

  assert(clear.notCalled)
})

test('throws with unexpected args', async () => {
  const withNum = () => bucket.remove(2)
  const withBool = () => bucket.remove(true)
  const withMixedArray = () => bucket.remove(['a', true])

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
