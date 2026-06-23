/**
 * Converts a string into a URL-safe slug:
 * "Acme Corp Inc." -> "acme-corp-inc"
 */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores/hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
