export function SkeletonBlock({ h = 16, w = '100%', style }: { h?: number | string; w?: number | string; style?: React.CSSProperties }) {
  return <div className="skel" aria-hidden="true" style={{ height: h, width: w, ...style }} />;
}

export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading page" className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <span className="sr">Loading…</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkeletonBlock h={12} w={200} />
          <SkeletonBlock h={72} w="90%" />
          <SkeletonBlock h={72} w="70%" />
          <SkeletonBlock h={18} w="80%" style={{ marginTop: 16 }} />
          <SkeletonBlock h={52} w={220} style={{ marginTop: 16, }} />
        </div>
        <div style={{ flex: '1 1 420px' }}><SkeletonBlock h={560}  /></div>
      </div>
    </div>
  );
}
