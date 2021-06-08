import { getBucket, storage } from './jest-mock'

import { MockBucket } from './jest-mock'
import { Subject } from 'rxjs'

jest.mock('../index.ts')

const MockInstance = jest.fn().constructor

test('storage.local is mocked', async () => {
  type AreaType = Record<string, any>
  type MockArea = MockBucket<AreaType>
  const mockStorageArea = storage.local as MockArea

  expect(mockStorageArea).toMatchObject<MockArea>({
    get: expect.any(MockInstance),
    set: expect.any(MockInstance),
    update: expect.any(MockInstance),
    remove: expect.any(MockInstance),
    clear: expect.any(MockInstance),
    getKeys: expect.any(MockInstance),
    changeStream: expect.any(Subject),
    valueStream: expect.any(Subject),
  })

  const defaultValue = { a: 'a', b: 1 }

  mockStorageArea.get.mockImplementation(async () => {
    return defaultValue
  })

  expect(await storage.local.get()).toEqual(defaultValue)
})

test('getBucket returns MockBucket', async () => {
  type AreaType = Record<string, any>
  type MockArea = MockBucket<AreaType>
  const storageArea = getBucket('test')
  const mockStorageArea = storageArea as MockArea

  expect(mockStorageArea).toMatchObject<MockArea>({
    get: expect.any(MockInstance),
    set: expect.any(MockInstance),
    update: expect.any(MockInstance),
    remove: expect.any(MockInstance),
    clear: expect.any(MockInstance),
    getKeys: expect.any(MockInstance),
    changeStream: expect.any(Subject),
    valueStream: expect.any(Subject),
  })

  const defaultValue = { a: 'a', b: 1 }

  mockStorageArea.get.mockImplementation(async () => {
    return defaultValue
  })

  expect(await storageArea.get()).toEqual(defaultValue)
})
