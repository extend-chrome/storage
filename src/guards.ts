export function isKeyof<T>(x: any): x is keyof T {
  return typeof x === 'string'
}

export function isNonNull<T>(value: T): value is NonNullable<T> {
  return value != null
}
