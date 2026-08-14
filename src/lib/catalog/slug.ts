const COMBINING = /[\u0300-\u036f]/g

/** Category slug used as the `t` tag on both products and collections. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}
