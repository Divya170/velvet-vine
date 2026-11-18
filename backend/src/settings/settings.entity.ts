import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { DayHours } from './days';

export { DAYS, DayHours } from './days';

export interface SocialLink {
  label: string;
  url: string;
}

/** Singleton (id = 1): shop identity, contact details, hours and every feature flag from the design comp. */
@Entity('settings')
export class Settings {
  @PrimaryColumn({ default: 1 })
  id: number;

  @Column({ default: 'Velvet Vine' })
  businessName: string;

  @Column({ default: 'Wine Boutique · Ventura' })
  tagline: string;

  @Column({ default: '6381 Cherry Lane' })
  addressLine1: string;

  @Column({ default: 'Ventura' })
  city: string;

  @Column({ default: 'CA' })
  region: string;

  @Column({ default: '93001' })
  postalCode: string;

  @Column({ default: 'USA' })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  /** The supplied number needs client confirmation; a "Verify" note shows until this is on. */
  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  mapEmbedUrl: string | null;

  @Column({ default: true })
  heroAutoplay: boolean;

  @Column({ type: 'integer', default: 7 })
  heroIntervalSeconds: number;

  /** Gallery "Moments from the boutique" strip: seconds per step (5–8). */
  @Column({ type: 'integer', default: 6 })
  galleryStripSeconds: number;


  /**
   * Legal-age confirmation overlay. OFF by default: switch it on only after Velvet Vine has confirmed the legal
   * requirement for its site. It asks a yes/no question only — no date of birth or other personal data is collected
   * or stored; the answer lives in the visitor's sessionStorage for that visit.
   */
  @Column({ default: false })
  ageGateEnabled: boolean;

  @Column({ type: 'integer', default: 21 })
  minimumAge: number;

  @Column({ type: 'simple-json', default: '[]' })
  hours: DayHours[];

  /** Hours are shown (and open-now is computed) only once the shop confirms them. Until then the site says “Store hours to be confirmed. Please call or email before visiting.” */
  @Column({ default: false })
  hoursVerified: boolean;

  /** Official social profiles only. */
  @Column({ type: 'simple-json', default: '[]' })
  socialLinks: SocialLink[];

  @Column({ default: 'An intimate wine boutique in Ventura, California, for discovering thoughtfully presented wines. Browse the collection online and visit us in store.' })
  footerNote: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
