interface Observable<T> {}

declare module '@bumble/storage' {
  export function useBucket<T>(
    area: string,
    name: string,
  ): StorageArea<T>

  export interface StorageArea<T> {
    get: (getter: any) => Promise<T>
    set: (setter: any) => Promise<void>
    update: () => Promise<void>
    remove: (key: string) => Promise<void>
    clear: () => Promise<void>
    readonly changeStream: Observable<any>
    readonly valueStream: Observable<any>
  }
}
