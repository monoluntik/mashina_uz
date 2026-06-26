/** Formats a number with space as thousands separator. Consistent on server and client. */
export function fmtNum(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " "); // non-breaking space
}
