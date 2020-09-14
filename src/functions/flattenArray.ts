export default <T>(arr: T[][]) =>
  arr.reduce((prev, curr) => prev.concat(curr), [])