export function isKeyof<T>(x: any): x is keyof T {
  return typeof x === 'string'
}
