import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { fieldErrors } from '../common/validation';
import { ProductsService } from '../products/products.service';
import { CreateInquiryDto, ListInquiriesQuery, UpdateInquiryDto } from './dto/inquiry.dto';
import { INQUIRY_SUBJECTS, Inquiry, InquirySubject } from './inquiry.entity';
import { validateInquiry } from './inquiry-rules';

export const SUBJECT_LABELS: Record<InquirySubject, string> = {
  general: 'General Inquiry', availability: 'Product Availability', collection: 'Collection Information', visit: 'Store Visit', other: 'Other',
};
const DUPLICATE_WINDOW_MS = 10 * 60_000;

@Injectable()
export class InquiriesService {
  /** Simple in-memory per-IP limiter (spam protection, together with the honeypot). */
  private readonly hits = new Map<string, number[]>();

  constructor(
    @InjectRepository(Inquiry) private readonly repo: Repository<Inquiry>,
    private readonly products: ProductsService,
    private readonly config: ConfigService,
  ) {}

  private rateLimit(ip: string) {
    const limit = Number(this.config.get('INQUIRY_RATE_LIMIT')) || 5;
    const now = Date.now();
    const recent = (this.hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
    if (recent.length >= limit) {
      throw new HttpException({ statusCode: 429, message: 'You’ve sent several messages in a short time. Please wait a few minutes, or email or call the shop.' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.hits.set(ip, recent);
  }

  private async newReference() {
    const d = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    for (;;) {
      const ref = `VV-${d}-${randomBytes(3).toString('hex').toUpperCase().slice(0, 4)}`;
      if ((await this.repo.count({ where: { reference: ref } })) === 0) return ref;
    }
  }

  async create(dto: CreateInquiryDto, ip: string) {
    // Honeypot filled → a bot. Reject without saving; never report success.
    if (String(dto.website ?? '').trim()) throw new HttpException({ statusCode: 400, message: 'Your message could not be sent.' }, HttpStatus.BAD_REQUEST);

    const { errors, clean } = validateInquiry(dto);
    // The chosen wine must be a currently published one.
    let productName: string | null = null;
    if (clean.productId != null) {
      productName = await this.products.findPublishedName(clean.productId);
      if (!productName) errors.product = clean.source === 'product' ? 'Choose the wine you’re asking about.' : 'That wine is no longer in the collection. Choose another, or leave it blank.';
    }
    if (Object.keys(errors).length) {
      const n = Object.keys(errors).length;
      throw fieldErrors(errors, n === 1 ? 'Please check 1 field before sending.' : `Please check ${n} fields before sending.`);
    }

    const fingerprint = createHash('sha256')
      .update([clean.source, clean.email.toLowerCase(), clean.subject, clean.productId ?? '', clean.message.toLowerCase().replace(/\s+/g, ' ')].join('|'))
      .digest('hex');
    const last = await this.repo.findOne({ where: { fingerprint }, order: { createdAt: 'DESC' } });
    if (last && Date.now() - new Date(last.createdAt).getTime() < DUPLICATE_WINDOW_MS) {
      throw new ConflictException({ statusCode: 409, message: 'This exact message was just sent, so it wasn’t sent again. Change a detail, or email or call us if you need to follow up.' });
    }

    this.rateLimit(ip || 'unknown');
    const saved = await this.repo.save(this.repo.create({ ...clean, productName, fingerprint, status: 'new', reference: await this.newReference() }));
    return {
      received: true,
      source: saved.source,
      subject: saved.subject,
      subjectLabel: SUBJECT_LABELS[saved.subject as InquirySubject],
      productName: saved.productName,
      name: saved.name,
      email: saved.email,
      hasPhone: !!saved.phone,
      createdAt: saved.createdAt,
    };
  }

  async list(q: ListInquiriesQuery) {
    const page = Math.max(1, parseInt(q.page || '1', 10) || 1);
    const pageSize = Math.min(100000, Math.max(5, parseInt(q.pageSize || '20', 10) || 20));
    const qb = this.repo.createQueryBuilder('i');
    if (q.status && q.status !== 'all') qb.andWhere('i.status = :status', { status: q.status });
    if (q.subject && q.subject !== 'all') qb.andWhere('i.subject = :subject', { subject: q.subject });
    if (q.source && q.source !== 'all') qb.andWhere('i.source = :source', { source: q.source });
    if (q.productId && Number(q.productId)) qb.andWhere('i.productId = :pid', { pid: Number(q.productId) });
    if (q.search?.trim()) {
      qb.andWhere('(LOWER(i.name) LIKE :s OR LOWER(i.email) LIKE :s OR i.phone LIKE :s OR LOWER(i.reference) LIKE :s OR LOWER(i.message) LIKE :s OR LOWER(i.productName) LIKE :s)', { s: `%${q.search.trim().toLowerCase()}%` });
    }
    qb.orderBy('i.createdAt', q.sort === 'oldest' ? 'ASC' : 'DESC').addOrderBy('i.id', q.sort === 'oldest' ? 'ASC' : 'DESC').skip((page - 1) * pageSize).take(pageSize);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async stats() {
    const rows = await this.repo.createQueryBuilder('i').select('i.status', 'status').addSelect('COUNT(*)', 'count').groupBy('i.status').getRawMany<{ status: string; count: string }>();
    const by = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
    const bySubject = await this.repo.createQueryBuilder('i').select('i.subject', 'subject').addSelect('COUNT(*)', 'count').where("i.status != 'archived'").groupBy('i.subject').getRawMany<{ subject: InquirySubject; count: string }>();
    const topWines = await this.repo.createQueryBuilder('i').select('i.productName', 'name').addSelect('COUNT(*)', 'count').where('i.productName IS NOT NULL').groupBy('i.productName').orderBy('count', 'DESC').limit(5).getRawMany<{ name: string; count: string }>();
    const since = new Date(Date.now() - 7 * 86_400_000);
    const lastWeek = (await this.repo.find({ select: { id: true, createdAt: true } })).filter((r) => new Date(r.createdAt) >= since).length;
    return {
      new: by.new ?? 0, responded: by.responded ?? 0, archived: by.archived ?? 0, total: rows.reduce((a, r) => a + Number(r.count), 0), lastWeek,
      bySubject: INQUIRY_SUBJECTS.map((s) => ({ subject: s, label: SUBJECT_LABELS[s], count: Number(bySubject.find((b) => b.subject === s)?.count ?? 0) })),
      topWines: topWines.map((t) => ({ name: t.name, count: Number(t.count) })),
    };
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Message not found.');
    return row;
  }

  async update(id: number, dto: UpdateInquiryDto) {
    const row = await this.findOne(id);
    if (dto.status) row.status = dto.status;
    if (dto.adminNotes !== undefined) row.adminNotes = dto.adminNotes?.trim() || null;
    return this.repo.save(row);
  }

  async remove(id: number) {
    await this.repo.remove(await this.findOne(id));
    return { ok: true };
  }

  async exportCsv(q: ListInquiriesQuery) {
    const { items } = await this.list({ ...q, page: '1', pageSize: '100000' });
    const cols: (keyof Inquiry)[] = ['reference', 'status', 'source', 'subject', 'createdAt', 'name', 'email', 'phone', 'productName', 'message', 'adminNotes'];
    const esc = (v: unknown) => {
      let s = v instanceof Date ? v.toISOString() : v == null ? '' : String(v);
      if (/^[=+\-@]/.test(s)) s = `'${s}`; // spreadsheet formula injection guard
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [cols.join(','), ...items.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  }
}

