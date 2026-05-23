/**
 * Formatting helpers — Arabic UI with Western Arabic numerals (1, 2, 3)
 * as is conventional in Libya / the Maghreb.
 */

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/** "12.50 د.ل" — always Western digits. */
export function formatLYD(n, digits = 2) {
  return `${Number(n ?? 0).toFixed(digits)} د.ل`;
}

/** "120.5 kWh" */
export function formatKwh(n, digits = 1) {
  return `${Number(n ?? 0).toFixed(digits)} kWh`;
}

/** "12 يناير 2026 • 14:30" — Western digits, Arabic month names. */
export function formatDateTime(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const day   = d.getDate();
  const month = AR_MONTHS[d.getMonth()];
  const year  = d.getFullYear();
  const h     = String(d.getHours()).padStart(2, '0');
  const m     = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} • ${h}:${m}`;
}

/** "12 يناير 2026" */
export function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Deterministic avatar background color from name string
const AVATAR_PALETTE = [
  '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
  '#ef4444', '#06b6d4', '#f97316', '#ec4899',
];

/** Returns a hex color deterministically from a string (for avatars). */
export function getAvatarColor(name = '') {
  let h = 0;
  for (const c of name) h = (h << 5) - h + c.charCodeAt(0);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

/** First character of name, fallback '?'. */
export function getInitial(name = '') {
  return name.trim()[0] ?? '?';
}

/** Relative time "منذ 5 دقائق" (Western digits). */
export function formatRelativeTime(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);

  if (diffSec < 60)     return 'الآن';
  if (diffSec < 3600)   return `منذ ${Math.floor(diffSec / 60)} دقيقة`;
  if (diffSec < 86400)  return `منذ ${Math.floor(diffSec / 3600)} ساعة`;
  if (diffSec < 604800) return `منذ ${Math.floor(diffSec / 86400)} يوم`;
  return formatDate(ts);
}
