const STORAGE_KEY = 'okey101:date-range';

export interface DateRangeCache {
  startDate: string;
  endDate: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local datetime value for <input type="datetime-local" /> */
export function toDateTimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function startOfTodayLocal(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toDateTimeLocalValue(d);
}

export function endOfTodayLocal(): string {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return toDateTimeLocalValue(d);
}

export function todayDateRange(): DateRangeCache {
  return {
    startDate: startOfTodayLocal(),
    endDate: endOfTodayLocal(),
  };
}

function isValidDateTimeLocal(value: string): boolean {
  if (value === '') return true;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
}

export function saveDateRangeCache(range: DateRangeCache): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(range));
}

export function loadDateRangeCache(): DateRangeCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DateRangeCache;
    if (
      typeof parsed.startDate !== 'string' ||
      typeof parsed.endDate !== 'string' ||
      !isValidDateTimeLocal(parsed.startDate) ||
      !isValidDateTimeLocal(parsed.endDate)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getInitialDateRange(): DateRangeCache {
  return loadDateRangeCache() ?? todayDateRange();
}
