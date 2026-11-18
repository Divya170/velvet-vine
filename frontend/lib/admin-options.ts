/** Shared select options for admin forms (kept out of page files: Next.js pages may only export page fields). */
export const TINT_OPTIONS = ['plain', 'dark', 'cream', 'rose', 'gold', 'char'].map((t) => ({ value: t, label: t === 'plain' ? 'Burgundy (default)' : t === 'char' ? 'Charcoal' : t[0].toUpperCase() + t.slice(1) }));
export const ICON_OPTIONS = ['glass', 'bottle', 'grape', 'compass', 'door', 'leaf', 'pin', 'phone', 'mail', 'clock'].map((i) => ({ value: i, label: i[0].toUpperCase() + i.slice(1) }));
