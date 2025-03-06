type KeyBy<T> = {
  [key: string]: T
}

export function keyBy<T>(array: T[], key: keyof T): KeyBy<T> {
  return array.reduce((result, item) => {
    const keyValue = item[key]
    if (typeof keyValue === 'string' || typeof keyValue === 'number') {
      result[keyValue] = item
    }
    return result
  }, {} as KeyBy<T>)
}
