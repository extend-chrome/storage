import { useBucket } from './bucket'
export declare const storage: {
  local: import('./bucket').StorageArea<{
    [x: string]: any
  }>
  sync: import('./bucket').StorageArea<{
    [x: string]: any
  }>
  managed: import('./bucket').StorageArea<{
    [x: string]: any
  }>
}
export { useBucket }
