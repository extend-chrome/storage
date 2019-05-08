export const invalidGetter = (g) => {
  switch (typeof g) {
    case 'undefined':
    case 'string':
    case 'function':
      return false
    case 'object': {
      if (Array.isArray(g)) {
        const x = g.find((x) => typeof x !== 'string')

        if (x) {
          return `Unexpected argument type: Array<${typeof x}>`
        }
      }

      return false
    }
    default:
      return `Unexpected argument type: ${typeof g}`
  }
}

export const invalidSetter = (s) => {
  if (Array.isArray(s)) {
    return 'Unexpected argument type: Array'
  } else if (s) {
    switch (typeof s) {
      case 'function':
      case 'object':
        return false
      default:
        return `Unexpected argument type: ${typeof s}`
    }
  }
}

export const invalidSetterReturn = (r) => {
  if (Array.isArray(r)) {
    return 'Unexpected setter result value: Array'
  } else {
    switch (typeof r) {
      case 'object':
      case 'undefined':
        return false
      default:
        return `Unexpected setter return value: ${typeof r}`
    }
  }
}
