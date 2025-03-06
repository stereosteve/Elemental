export function slugify(str: string) {
  return str.replaceAll(/[^A-Za-z0-9 ]/g, '').replaceAll(/\s+/g, '-')
}
