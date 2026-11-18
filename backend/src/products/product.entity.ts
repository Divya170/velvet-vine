import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProductCategory, Tint } from './product-category.entity';

/** A wine in the boutique’s collection. Deliberately no price, stock, cart or shipping fields: the site is for discovery and in-store visits only, never online alcohol sales. */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'integer' })
  categoryId: number;

  @ManyToOne(() => ProductCategory, (c) => c.products, { onDelete: 'RESTRICT' })
  category: ProductCategory;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  /** Shown only when supplied by the shop — never invented. */
  @Column({ type: 'varchar', nullable: true })
  region: string | null;

  @Column({ type: 'varchar', nullable: true })
  grapeVariety: string | null;

  /** Optional extra notes (e.g. tasting notes, vintage) — only ever text the boutique supplies. */
  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ default: '' })
  imageAlt: string;

  @Column({ type: 'varchar', nullable: true })
  tint: Tint | null;

  /** Shown in the homepage "Bottles worth a closer look" section. */
  @Column({ default: false })
  featured: boolean;

  /** Listed in its style’s editorial selection on Our Collection (and in the Wine Details spotlight). */
  @Column({ default: true })
  curated: boolean;

  /** Seeded design samples carry a visible "Sample" tag until replaced with real wines. */
  @Column({ default: false })
  isSample: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
