import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { removeUpload } from '../common/upload';
import { CreateGalleryItemDto, UpdateGalleryItemDto } from './dto/gallery.dto';
import { GALLERY_CATEGORIES, GalleryCategory, GalleryItem } from './gallery-item.entity';

@Injectable()
export class GalleryService {
  constructor(@InjectRepository(GalleryItem) private readonly repo: Repository<GalleryItem>) {}

  async listPublic(category?: string) {
    const all = await this.repo.find({ where: { published: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
    const valid = (GALLERY_CATEGORIES as readonly string[]).includes(category ?? '');
    const items = valid ? all.filter((i) => i.category === category) : all;
    // Only categories that actually have photos are offered as filters.
    const categories = [
      { name: 'All', count: all.length },
      ...GALLERY_CATEGORIES.map((c) => ({ name: c, count: all.filter((i) => i.category === c).length })).filter((c) => c.count > 0),
    ];
    return { category: valid ? category : 'All', categories, items };
  }

  async homePreview() {
    const featured = await this.repo.find({ where: { published: true, featuredOnHome: true }, order: { sortOrder: 'ASC', id: 'ASC' }, take: 6 });
    if (featured.length >= 6) return featured;
    const rest = await this.repo.find({ where: { published: true }, order: { sortOrder: 'ASC', id: 'ASC' }, take: 12 });
    const ids = new Set(featured.map((f) => f.id));
    return [...featured, ...rest.filter((r) => !ids.has(r.id))].slice(0, 6);
  }

  /** The Gallery page's featured strip. Hidden on the site when fewer than three photos are picked. */
  strip() {
    return this.repo.find({ where: { published: true, inStrip: true }, order: { sortOrder: 'ASC', id: 'ASC' }, take: 12 });
  }

  listAdmin(search?: string, category?: GalleryCategory) {
    const qb = this.repo.createQueryBuilder('g').orderBy('g.sortOrder', 'ASC').addOrderBy('g.id', 'ASC');
    if (search?.trim()) qb.andWhere('(LOWER(g.title) LIKE :q OR LOWER(g.alt) LIKE :q)', { q: `%${search.trim().toLowerCase()}%` });
    if (category) qb.andWhere('g.category = :category', { category });
    return qb.getMany();
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Photo not found.');
    return row;
  }

  async create(dto: CreateGalleryItemDto) {
    return this.repo.save(this.repo.create({ ...dto, sortOrder: dto.sortOrder ?? (await this.repo.count()) }));
  }

  async update(id: number, dto: UpdateGalleryItemDto) {
    const row = await this.findOne(id);
    Object.assign(row, dto);
    return this.repo.save(row);
  }

  async setImage(id: number, url: string | null) {
    const row = await this.findOne(id);
    removeUpload(row.imageUrl);
    row.imageUrl = url;
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    removeUpload(row.imageUrl);
    await this.repo.remove(row);
    return { ok: true };
  }

  async seed(rows: Partial<GalleryItem>[]) {
    if ((await this.repo.count()) > 0) return;
    await this.repo.save(rows.map((r) => this.repo.create(r)));
  }
}
