import { DAYS, DayHours } from './days';

export function defaultHours(): DayHours[] {
  return DAYS.map((day) => ({ day, open: null, close: null, closed: false }));
}

export function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** Weekday index (0 = Monday) and minutes past midnight in the shop's timezone. */
export function nowIn(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const dayIdx = DAYS.indexOf(get('weekday'));
  return { dayIdx: dayIdx < 0 ? 0 : dayIdx, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function displayHours(hours: DayHours[], verified: boolean) {
  const list = DAYS.map((day) => hours.find((h) => h.day === day) ?? { day, open: null, close: null, closed: false });
  return list.map((h) => ({
    day: h.day,
    label: !verified ? '[Hours to confirm]' : h.closed ? 'Closed' : h.open && h.close ? `${fmt12(h.open)} – ${fmt12(h.close)}` : 'Hours to confirm',
    confirmed: verified && (h.closed || !!(h.open && h.close)),
  }));
}

/**
 * Open/closed status — only when hours are verified. Handles closing after midnight
 * (e.g. 18:00–01:00 counts the early hours of the next day).
 */
export function openStatus(hours: DayHours[], verified: boolean, timeZone: string, date = new Date()) {
  if (!verified) return null;
  const list = DAYS.map((day) => hours.find((h) => h.day === day));
  if (list.some((h) => !h || (!h.closed && (!h.open || !h.close)))) return null;
  const { dayIdx, minutes } = nowIn(timeZone, date);
  const span = (i: number) => {
    const h = list[i]!;
    if (h.closed) return null;
    const o = toMin(h.open!);
    let c = toMin(h.close!);
    if (c <= o) c += 24 * 60;
    return { o, c, close: h.close!, open: h.open! };
  };
  const today = span(dayIdx);
  const yesterday = span((dayIdx + 6) % 7);
  if (yesterday && yesterday.c > 24 * 60 && minutes < yesterday.c - 24 * 60) return { isOpen: true, label: `Open now · until ${fmt12(yesterday.close)}` };
  if (today && minutes >= today.o && minutes < today.c) return { isOpen: true, label: `Open now · until ${fmt12(today.close)}` };
  if (today && minutes < today.o) return { isOpen: false, label: `Closed now · opens today at ${fmt12(today.open)}` };
  for (let k = 1; k <= 7; k++) {
    const i = (dayIdx + k) % 7;
    const s = span(i);
    if (s) return { isOpen: false, label: `Closed now · opens ${k === 1 ? 'tomorrow' : DAYS[i]} at ${fmt12(s.open)}` };
  }
  return { isOpen: false, label: 'Closed now' };
}
