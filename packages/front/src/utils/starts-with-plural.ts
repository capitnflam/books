import { plural } from 'pluralize'

/**
 * for pathname matching
 * str starts with word (plural or singular)
 */
export function startsWithPlural(str: string, word: string) {
  const splitWord = word.split('/')
  const splitStr = str.split('/')

  if (splitWord.length >= splitStr.length) {
    return false
  }

  for (let it = 0; it < splitWord.length; it++) {
    const pluralWord = plural(splitWord[it])
    const pluralStr = plural(splitStr[it])

    if (pluralWord !== pluralStr) {
      return false
    }
  }

  return true
}
