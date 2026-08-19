/**
 * Capitalizes the first letter of a string while preserving the rest.
 * @param text - The text to capitalize
 * @returns Text with first letter capitalized
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text || text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
