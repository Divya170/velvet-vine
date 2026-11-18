import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Where the message came from: the Contact page form, or a wine card's "Ask About This Wine" dialog. */
export const INQUIRY_SOURCES = ['contact', 'product'] as const;
export type InquirySource = (typeof INQUIRY_SOURCES)[number];
/** The Contact form's Inquiry Type options, exactly as in the brief. Wine-card inquiries are filed as 'availability'. */
export const INQUIRY_SUBJECTS = ['general', 'availability', 'collection', 'visit', 'other'] as const;
export type InquirySubject = (typeof INQUIRY_SUBJECTS)[number];
export const INQUIRY_STATUSES = ['new', 'responded', 'archived'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn()
  id: number;

  /** Internal reference for the shop (VV-yymmdd-XXXX). */
  @Index({ unique: true })
  @Column()
  reference: string;

  @Index()
  @Column({ type: 'varchar' })
  source: InquirySource;

  @Index()
  @Column({ type: 'varchar' })
  subject: InquirySubject;

  @Column()
  name: string;

  @Index()
  @Column()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  /** The wine asked about, if any; the name is kept even if the wine is later renamed or removed. */
  @Index()
  @Column({ type: 'integer', nullable: true })
  productId: number | null;

  @Column({ type: 'varchar', nullable: true })
  productName: string | null;

  @Column({ type: 'text' })
  message: string;

  @Index()
  @Column({ type: 'varchar', default: 'new' })
  status: InquiryStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string | null;

  /** SHA-256 of the submitted content, used to refuse an identical resubmission within 10 minutes. */
  @Index()
  @Column({ type: 'varchar', default: '' })
  fingerprint: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
