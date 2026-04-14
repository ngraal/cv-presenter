/**
 * Normalize date strings in various formats to MM/YYYY display format.
 * Supported inputs: YYYY-MM, MM/YYYY, YYYY/MM
 * Returns the original string if no pattern matches.
 */
export function formatDate(date: string): string {
  // YYYY-MM or YYYY/MM
  const yFirst = date.match(/^(\d{4})[-/](\d{1,2})$/);
  if (yFirst) return `${yFirst[2].padStart(2, "0")}/${yFirst[1]}`;

  // MM/YYYY
  const mFirst = date.match(/^(\d{1,2})\/(\d{4})$/);
  if (mFirst) return `${mFirst[1].padStart(2, "0")}/${mFirst[2]}`;

  return date;
}
