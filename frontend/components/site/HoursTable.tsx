import type { SiteSettings } from '@/lib/types';
import { ClientNote } from './ClientNote';

/**
 * Weekly hours. Until the boutique verifies them, every day reads "[Hours to confirm]" and no open/closed
 * status is shown, exactly as in the design.
 */
export function HoursTable({ settings }: { settings: SiteSettings }) {
  return (
    <>
      {settings.hoursVerified && settings.openStatus && <p className="label" style={{ color: settings.openStatus.isOpen ? '#D9C08F' : '#E7DCD2' }}>{settings.openStatus.label}</p>}
      <dl className="hours">
        {settings.hoursDisplay.map((d) => (
          <div key={d.day} style={d.isToday && settings.hoursVerified ? { fontWeight: 700 } : undefined}>
            <dt>{d.day}{d.isToday && settings.hoursVerified && <span className="sr"> (today)</span>}</dt>
            <dd style={settings.hoursVerified ? { fontStyle: 'normal' } : undefined}>{settings.hoursVerified ? d.label : '[Hours to confirm]'}</dd>
          </div>
        ))}
      </dl>
      {!settings.hoursVerified && <ClientNote style={{ marginTop: 16 }} note="Store hours are editable placeholders until Velvet Vine confirms them. No open/closed status is shown before then." />}
    </>
  );
}
