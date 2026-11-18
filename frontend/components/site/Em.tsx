import { emphasis } from '@/lib/api';

/** Renders "*words*" in a heading as the design's italic accent (burgundy on light, gold on dark). */
export function Em({ text, onDark }: { text: string; onDark?: boolean }) {
  const { before, em, after } = emphasis(text);
  if (!em) return <>{text}</>;
  return <>{before}<em style={onDark ? { color: '#D9C08F' } : undefined}>{em}</em>{after}</>;
}

export const plain = (t: string) => t.replace(/\*/g, '');
