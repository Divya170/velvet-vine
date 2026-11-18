import { mediaUrl, tintClass } from '@/lib/api';
import type { Tint } from '@/lib/types';

interface Props {
  src?: string | null;
  alt: string;
  /** Text for the placeholder tag while no real photo exists. */
  label?: string;
  tint?: Tint | string | null;
  className?: string;
  style?: React.CSSProperties;
  zoom?: boolean;
  kenBurns?: boolean;
  priority?: boolean;
  /** Use the exact label (no "Photo placeholder ·" prefix). */
  shortTag?: boolean;
  tagStyle?: React.CSSProperties;
  noTag?: boolean;
  children?: React.ReactNode;
}

/** A real photograph when uploaded; otherwise the design's textured, clearly tagged placeholder — never stock imagery. */
export function Photo({ src, alt, label, tint, className = '', style, zoom, kenBurns, priority, shortTag, tagStyle, noTag, children }: Props) {
  const url = mediaUrl(src);
  const tc = tintClass(tint);
  const inner = [zoom ? 'zoom' : '', kenBurns ? 'kb' : ''].filter(Boolean).join(' ');
  const text = label ?? alt;
  return (
    <div className={`ph ${tc} ${url ? 'has-img' : ''} ${className}`} style={style}>
      {url ? (
        <div className={inner} style={{ position: 'absolute', inset: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cover" src={url} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} />
        </div>
      ) : (
        <>
          {inner && <div className={`ph ${tc} ${inner}`} aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />}
          {!noTag && text && <p className="ph-tag" style={tagStyle}>{shortTag ? text : `Photo placeholder · ${text}`}</p>}
        </>
      )}
      {children}
    </div>
  );
}
