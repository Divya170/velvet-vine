import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';

/** Placeholder tints, matching the design's photo panels (plain = the default burgundy-to-sand gradient). */
export const TINTS = ['plain', 'dark', 'cream', 'rose', 'gold', 'char'] as const;
export type Tint = (typeof TINTS)[number];

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  /** Used in /wines?category=<slug>. */
  @Column({ unique: true })
  slug: string;

  /** Short style label on cards and filter chips, e.g. "Red". */
  @Column({ default: '' })
  shortName: string;

  /** Short general description shown on category tiles and above the filtered catalogue. */
  @Column({ type: 'text', default: '' })
  blurb: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ default: '' })
  imageAlt: string;

  @Column({ type: 'varchar', default: 'plain' })
  tint: Tint;

  /** Our Collection: the editorial selection for this style (e.g. "Red Wine Selection"). */
  @Column({ default: '' })
  selectionTitle: string;

  @Column({ type: 'text', default: '' })
  selectionBody: string;

  /** A selection is shown on Our Collection only when this is on and it lists at least one published wine. */
  @Column({ default: true })
  selectionPublished: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  published: boolean;

  @OneToMany(() => Product, (p) => p.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
