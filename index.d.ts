/// reference types="chrome"

import { Observable } from 'rxjs'

type PlainObject = {
  [prop: string]: string | number | boolean | null | PlainObject
}

type Getter =
  | string
  | {
      [prop: string]: any
    }
  | ((values: { [prop: string]: any }) => any)

type Setter =
  | {
      [prop: string]: any
    }
  | ((prev: {
      [prop: string]: any
    }) => {
      [prop: string]: any
    })

interface StorageArea {
  get: (getter: Getter) => Promise<any>
  set: (setter: Setter) => Promise<PlainObject>
  remove: (query: string) => Promise<PlainObject>
  clear: () => Promise<PlainObject>
  change$: Observable<chrome.storage.StorageChange>
}

export namespace storage {
  export const local: StorageArea
  export const sync: StorageArea
  export const managed: StorageArea
}
