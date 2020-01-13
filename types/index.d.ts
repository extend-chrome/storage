import { useBucket } from './bucket';
import { StorageArea } from './types';
export declare const storage: {
    local: StorageArea<import("./types").AtLeastOne<Record<string, any>, {
        [x: string]: Pick<Record<string, any>, string>;
    }>>;
    sync: StorageArea<import("./types").AtLeastOne<Record<string, any>, {
        [x: string]: Pick<Record<string, any>, string>;
    }>>;
    managed: StorageArea<import("./types").AtLeastOne<Record<string, any>, {
        [x: string]: Pick<Record<string, any>, string>;
    }>>;
};
export { useBucket, StorageArea };
