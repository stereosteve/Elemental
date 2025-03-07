export function slugify(str: string) {
  return str.replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, '-')
}
