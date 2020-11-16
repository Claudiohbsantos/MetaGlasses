export function clean<T extends object>(obj: T): T {
  const copy = { ...obj }
  for (const key in obj) {
    if (obj[key] === undefined) delete copy[key]
  }
  return copy
}
