import { chromepApi } from 'chrome-promise/chrome-promise';
import { Bucket, AreaName } from './types';
export declare const getStorageArea: (area: AreaName) => chromepApi.storage.StorageArea;
/**
 * Create a bucket (synthetic storage area).
 *
 * @param {string} bucketName Must be a id for each bucket.
 * @param {string} [areaName = 'local'] The name of the storage area to use.
 * @returns {Bucket} Returns a bucket.
 */
export declare function getBucket<T extends {
    [prop: string]: any;
}>(bucketName: string, areaName?: AreaName): Bucket<T>;
