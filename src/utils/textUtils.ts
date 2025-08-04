/**
 * Removes Vietnamese diacritics from a string
 * @param str - The string to remove diacritics from
 * @returns The string without diacritics
 */
export function removeDiacritics(str: string): string {
  if (!str) return "";

  // Normalize and remove diacritics
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Normalizes text for search (removes diacritics and converts to lowercase)
 * @param text - The text to normalize
 * @returns Normalized text for search
 */
export function normalizeForSearch(text: string): string {
  return removeDiacritics(text).toLowerCase().trim();
}

/**
 * Checks if a search term matches text (case-insensitive, diacritic-insensitive)
 * @param text - The text to search in
 * @param searchTerm - The search term
 * @returns Whether the search term matches
 */
export function searchMatch(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;

  const normalizedText = normalizeForSearch(text);
  const normalizedSearch = normalizeForSearch(searchTerm);

  return normalizedText.includes(normalizedSearch);
}

/**
 * Builds a search-friendly slug from text
 * @param text - The text to convert to slug
 * @returns Search-friendly slug
 */
export function createSearchSlug(text: string): string {
  return normalizeForSearch(text)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
