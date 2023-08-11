interface WithId {
  id: number
}

export function transformURI<T extends WithId>(prefix: string) {
  return (item: T) => {
    const { id, ...rest } = item
    const uri = `${prefix}/${id}`
    return { ...rest, uri }
  }
}
