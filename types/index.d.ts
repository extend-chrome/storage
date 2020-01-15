import { getBucket } from './bucket';
/**
 * Buckets for each storage area.
 */
export declare const storage: {
    local: import("./types").Bucket<Record<string, any>>;
    sync: import("./types").Bucket<Record<string, any>>;
    managed: import("./types").Bucket<Record<string, any>>;
};
export * from './types';
export { getBucket };
/**
 * Deprecated. Use `getBucket`.
 */
export declare const useBucket: (areaName: import("./types").AreaName, bucketName: string) => import("./types").Bucket<{
    [prop: string]: any;
}>;
