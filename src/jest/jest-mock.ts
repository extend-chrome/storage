import { Bucket, Changes } from '..'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Subject } from 'rxjs'

/**
 * This module is a pre-mocked version of storage for use with Jest.
 *
 * The event streams are RxJs Subjects
 *
 * ```javascript
 * // __mocks__/storage.js
 * module.exports = require('@extend-chrome/storage/jest')
 * ```
 *
 * ```typescript
 * // __mocks__/storage.ts
 * export * from '@extend-chrome/storage/jest'
 * ```
 */

export interface MockBucket<T extends object> extends Bucket<T> {
  get: jest.MockedFunction<Bucket<T>['get']>
  set: jest.MockedFunction<Bucket<T>['set']>
  update: jest.MockedFunction<Bucket<T>['update']>
  remove: jest.MockedFunction<Bucket<T>['remove']>
  clear: jest.MockedFunction<Bucket<T>['clear']>
  changeStream: Subject<Changes<T>>
  valueStream: Subject<T>
}

export const getBucket = <T extends object>(
  bucketName: string,
  areaName?: string,
): MockBucket<T> => ({
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  getKeys: jest.fn(),
  changeStream: new Subject<Changes<T>>(),
  valueStream: new Subject<T>(),
})

export const useBucket = (
  areaName: string,
  bucketName: string,
) => getBucket(bucketName, areaName)

/**
 * Buckets for each storage area.
 */
export const storage = {
  local: getBucket<Record<string, any>>('local', 'local'),
  sync: getBucket<Record<string, any>>('sync', 'sync'),
  managed: getBucket<Record<string, any>>('managed', 'managed'),
}
