export function corsMatcher(
  origin: string | undefined,
  allowedOrigin: string,
): boolean {
  if (origin === undefined) {
    return false
  }
  return origin.match(`(http(s)?://)?${allowedOrigin}`) !== null
}
