export const asyncMap = <T1, T2>(array: T1[], asyncFunction: (item: T1, index?: number, array?: T1[]) => Promise<T2>): Promise<T2[]> =>
  Promise.all(array.map(asyncFunction))

export const asyncFilter = async <T>(array: T[], asyncFunction: Function): Promise<T[]> => {
  const promises = array.map(
    async item => Boolean(await asyncFunction(item)) ? item : false
  )

  const mixed = await Promise.all(promises)

  return mixed.filter(i => i !== false) as T[]
}