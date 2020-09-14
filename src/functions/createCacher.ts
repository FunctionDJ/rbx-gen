export default <T>(retrieveFunction: (key: string) => Promise<T>) => {
  const map = new Map()

  return async (key: string) => {
    if (map.has(key)) {
      return map.get(key) as T
    }

    const data = await retrieveFunction(key)
    map.set(key, data)
    return data
  }
}