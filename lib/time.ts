/**
 * IST (Indian Standard Time - Asia/Kolkata, UTC+05:30) Date Utilities
 * Ensures accurate calendar dates for Bengaluru operations, preventing UTC midnight lag
 * where new Date().toISOString() returns yesterday's date between 12:00 AM and 5:30 AM IST.
 */

const IST_TIMEZONE = 'Asia/Kolkata';

const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

/**
 * Returns YYYY-MM-DD in Indian Standard Time (Asia/Kolkata)
 */
export function getTodayIST(dateInput: Date | number = new Date()): string {
  const d = typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  return istDateFormatter.format(d);
}

/**
 * Returns tomorrow's YYYY-MM-DD in IST
 */
export function getTomorrowIST(baseDate: Date | number = new Date()): string {
  const d = typeof baseDate === 'number' ? new Date(baseDate) : new Date(baseDate);
  d.setDate(d.getDate() + 1);
  return istDateFormatter.format(d);
}

/**
 * Returns yesterday's YYYY-MM-DD in IST
 */
export function getYesterdayIST(baseDate: Date | number = new Date()): string {
  const d = typeof baseDate === 'number' ? new Date(baseDate) : new Date(baseDate);
  d.setDate(d.getDate() - 1);
  return istDateFormatter.format(d);
}

/**
 * Returns YYYY-MM-DD for N days ago in IST
 */
export function getDaysAgoIST(days: number, baseDate: Date | number = new Date()): string {
  const d = typeof baseDate === 'number' ? new Date(baseDate) : new Date(baseDate);
  d.setDate(d.getDate() - days);
  return istDateFormatter.format(d);
}

/**
 * Returns YYYY-MM prefix for current month in IST
 */
export function getCurrentMonthIST(baseDate: Date | number = new Date()): string {
  const today = getTodayIST(baseDate);
  return today.slice(0, 7);
}

/**
 * Formats a Date / ISO string into a local timestamp in IST
 */
export function getNowISTTimestamp(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date()).replace(',', '');
}
