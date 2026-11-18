import { Footer, StickyCta } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { getCollection, getSettings } from '@/lib/api';
import type { ProductCategory, SiteSettings } from '@/lib/types';
import { RetryButton } from './RetryButton';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let settings: SiteSettings | null = null;
  let styles: ProductCategory[] = [];
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }
  try {
    styles = (await getCollection()).categories;
  } catch {
    styles = []; // the footer simply omits the style links
  }

  if (!settings) {
    return (
      <main id="main" className="wrap" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 20 }}>
        <p className="eyebrow">Velvet Vine</p>
        <h1 className="h2" style={{ margin: 0 }}>We’ll be right back.</h1>
        <p className="lead" style={{ maxWidth: 520 }}>The website can’t load the boutique’s information right now. Please try again in a moment.</p>
        <RetryButton />
      </main>
    );
  }

  return (
    <div className="site-pad">
      <Header settings={settings} />
      {children}
      <Footer settings={settings} styles={styles} />
      <StickyCta phoneHref={settings.phoneHref} />
    </div>
  );
}
