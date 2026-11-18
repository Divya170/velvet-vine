import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { removeUpload } from '../common/upload';
import { ContentBlock, ContentType } from './content-block.entity';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(@InjectRepository(ContentBlock) private readonly repo: Repository<ContentBlock>) {}

  listPublic(type?: ContentType) {
    const where: FindOptionsWhere<ContentBlock> = { published: true };
    if (type) where.type = type;
    return this.repo.find({ where, order: { type: 'ASC', sortOrder: 'ASC', id: 'ASC' } });
  }

  /** Page copy as a { key: block } map for one-request page rendering. */
  async pageCopy() {
    const rows = await this.repo.find({ where: { type: 'page_copy', published: true } });
    return Object.fromEntries(rows.filter((r) => r.key).map((r) => [r.key as string, r]));
  }

  listAdmin(type?: ContentType, search?: string) {
    const qb = this.repo.createQueryBuilder('c').orderBy('c.type', 'ASC').addOrderBy('c.sortOrder', 'ASC').addOrderBy('c.id', 'ASC');
    if (type) qb.andWhere('c.type = :type', { type });
    if (search?.trim()) qb.andWhere('(LOWER(c.title) LIKE :q OR LOWER(c.body) LIKE :q OR LOWER(c.key) LIKE :q)', { q: `%${search.trim().toLowerCase()}%` });
    return qb.getMany();
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Content block not found.');
    return row;
  }

  async create(dto: CreateContentDto) {
    const sortOrder = dto.sortOrder ?? (await this.repo.count({ where: { type: dto.type } }));
    return this.repo.save(this.repo.create({ ...dto, fields: dto.fields ?? {}, sortOrder }));
  }

  async update(id: number, dto: UpdateContentDto) {
    const row = await this.findOne(id);
    if (dto.fields) row.fields = { ...row.fields, ...dto.fields };
    const { fields: _f, ...rest } = dto;
    Object.assign(row, rest);
    return this.repo.save(row);
  }

  /** Photo slots: the main imageUrl, plus image2Url / image3Url for sections with secondary photos. */
  async setImage(id: number, url: string | null, slot?: string) {
    const key = slot === 'image2Url' || slot === 'image3Url' ? slot : 'imageUrl';
    const row = await this.findOne(id);
    removeUpload(row.fields?.[key]);
    row.fields = { ...row.fields, [key]: url };
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    for (const k of ['imageUrl', 'image2Url', 'image3Url']) removeUpload(row.fields?.[k]);
    await this.repo.remove(row);
    return { ok: true };
  }

  async reorder(ids: number[]) {
    await Promise.all(ids.map((id, i) => this.repo.update({ id }, { sortOrder: i })));
    return { ok: true };
  }

  async count() {
    return this.repo.count();
  }

  async seed(rows: Partial<ContentBlock>[]) {
    if ((await this.repo.count()) > 0) return;
    await this.repo.save(rows.map((r) => this.repo.create(r)));
  }
}
