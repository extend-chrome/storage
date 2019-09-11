export interface GetterFn<T> {
  (values: T): any
}

export type NativeGetter<T> = string | string[] | T
export type Getter<T> = NativeGetter<T> | GetterFn<T>

export interface SetterFn<T> {
  (prev: T): T
}
export interface AsyncSetterFn<T> {
  (prev: T): Promise<T>
}

export type Setter<T> = T | SetterFn<T>

export type Changes<T> = {
  [K in keyof T]?: {
    oldValue: T[K]
    newValue: T[K]
  }
}

export type AnyObject = {
  [prop: string]: any
}
