import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const CONTENT_TYPES = ['page_copy', 'hero_slide', 'experience_item', 'philosophy_item', 'store_point'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * One polymorphic entity for every simple CMS collection.
 * - page_copy: keyed blocks of page text (key = 'home_hero', 'wines_hero', …). title may contain *emphasis*;
 *   fields.eyebrow / fields.cta / fields.body2 / fields.quote are optional extras used by some sections.
 * - hero_slide: homepage cross-fading photos (fields.imageUrl, tint; title = alt text / placeholder label)
 * - experience_item: the four homepage "Find Your Next Favourite Bottle" highlights (fields.icon)
 * - philosophy_item: the four About "quiet principles" (fields.icon, fields.numeral)
 * - store_point: the three About "Step inside" points
 * fields.clientNote, when set, renders as a dashed "Client to supply" note on the site.
 */
@Entity('content_blocks')
@Index(['type', 'key'])
export class ContentBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: ContentType;

  @Column({ type: 'varchar', nullable: true })
  key: string | null;

  @Column({ default: '' })
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ type: 'simple-json', default: '{}' })
  fields: Record<string, string | null>;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
