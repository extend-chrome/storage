export interface GetterFn<T> {
  (values: T): any
}
export declare type NativeGetter<T> = string | string[] | T
export declare type Getter<T> = NativeGetter<T> | GetterFn<T>
export interface SetterFn<T> {
  (prev: T): T
}
export interface AsyncSetterFn<T> {
  (prev: T): Promise<T>
}
export declare type Setter<T> = T | SetterFn<T>
export declare type Changes<T> = {
  [K in keyof T]?: {
    oldValue: T[K]
    newValue: T[K]
  }
}
export declare type AnyObject = {
  [prop: string]: any
}
