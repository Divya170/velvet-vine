import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const GALLERY_CATEGORIES = ['Boutique Interior', 'Wine Shelves', 'Bottle Displays', 'Product Photography', 'Store Details', 'Atmosphere'] as const;
export { TINTS } from '../products/product-category.entity';
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

@Entity('gallery_items')
export class GalleryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'varchar' })
  category: GalleryCategory;

  /** Null = not yet photographed; the site shows a clearly labelled placeholder panel. */
  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ default: '' })
  alt: string;

  /** Masonry tile size on desktop. */
  @Column({ type: 'integer', default: 2 })
  rows: number;

  @Column({ type: 'integer', default: 1 })
  cols: number;

  /** Placeholder panel tint while no photo exists. */
  @Column({ type: 'varchar', default: 'plain' })
  tint: string;

  /** Shown in the Gallery page's slowly moving "Moments from the boutique" strip — the page's only auto-moving element. */
  @Column({ default: false })
  inStrip: boolean;

  /** Shown in the homepage "Inside the boutique" mosaic (first six by order). */
  @Column({ default: false })
  featuredOnHome: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
