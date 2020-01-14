import { useBucket } from '../../src/bucket'
import {
  clear,
  get,
  keysName,
  remove,
  set,
  x,
  y,
  bucketName,
  Bucket,
} from './setup'

beforeEach(() => {
  jest.clearAllMocks()
})

test('clear', async () => {
  const bucket = useBucket<Bucket>('local', bucketName)

  await bucket.clear()

  expect(set).not.toBeCalled()
  expect(clear).not.toBeCalled()

  expect(get).toBeCalledTimes(1)
  expect(get).toBeCalledWith(keysName, expect.any(Function))

  expect(remove).toBeCalledTimes(1)
  expect(remove).toBeCalledWith(
    [keysName, x, y],
    expect.any(Function),
  )
})
