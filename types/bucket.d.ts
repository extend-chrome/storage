import { chromepApi } from 'chrome-promise/chrome-promise';
import { AtLeastOne, StorageArea } from './types';
export declare const getStorageArea: (area: "sync" | "local" | "managed") => chromepApi.storage.StorageArea;
export declare function useBucket<T extends {
    [prop: string]: any;
}>(area: 'local' | 'sync' | 'managed', name: string): StorageArea<AtLeastOne<T>>;
