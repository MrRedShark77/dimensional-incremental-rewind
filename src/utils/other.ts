export function splitIntoGroups(keys: string[], space: string = '\\'): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  keys.map(x => [x.split(space)[0],x]).forEach(([x,y]) => (groups[x] ??= []).push(y))
  return groups
}
