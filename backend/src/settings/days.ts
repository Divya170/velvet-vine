export interface DayHours {
  day: string;
  /** "HH:MM" 24h, or null when not yet confirmed */
  open: string | null;
  close: string | null;
  closed: boolean;
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
