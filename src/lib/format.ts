/** Formats a number with space as thousands separator. */
export function fmtNum(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Formats price compactly: 135_000_000 → "135 млн", 12_500_000 → "12.5 млн" */
export function fmtPrice(n: number, locale = "ru"): string {
  const mln = locale === "ru" ? "млн" : "mln";
  const tys = locale === "ru" ? "тыс" : "ming";
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1)} млрд`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1)} ${mln}`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v : v.toFixed(0)} ${tys}`;
  }
  return fmtNum(n);
}
