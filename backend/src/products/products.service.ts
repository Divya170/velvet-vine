import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../common/slug';
import { removeUpload } from '../common/upload';
import { CreateCategoryDto, CreateProductDto, UpdateCategoryDto, UpdateProductDto } from './dto/product.dto';
import { ProductCategory, Tint } from './product-category.entity';
import { Product } from './product.entity';

const blankToNull = (v?: string | null) => (v == null || String(v).trim() === '' ? null : String(v).trim());

export interface CategorySeed { slug: string; name: string; shortName: string; blurb: string; tint: Tint; imageAlt: string; selectionTitle: string; selectionBody: string }
export interface ProductSeed { category: string; name: string; imageAlt: string; tint: Tint | null; featured: boolean }

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductCategory) private readonly cats: Repository<ProductCategory>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  /* ---------- public ---------- */

  /**
   * The whole published collection in one call. Only categories that have at least one published wine are
   * returned (the brief: only show styles the boutique actually has); filtering is client-side.
   */
  async publicCollection() {
    const categories = await this.cats.find({ where: { published: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
    const ids = new Set(categories.map((c) => c.id));
    const all = await this.products.find({ where: { published: true }, order: { sortOrder: 'ASC', id: 'ASC' } });
    const items = all.filter((p) => ids.has(p.categoryId)).map((p) => ({ ...p, category: undefined }));
    const withCounts = categories.map((c) => ({ ...c, count: items.filter((p) => p.categoryId === c.id).length }));
    return { categories: withCounts.filter((c) => c.count > 0), allCategories: withCounts, items, total: items.length };
  }

  /** Homepage featured bottles: featured first, topped up with other published wines. */
  async featured(limit = 4) {
    const { items } = await this.publicCollection();
    const f = items.filter((p) => p.featured);
    return [...f, ...items.filter((p) => !p.featured)].slice(0, limit);
  }

  /** Our Collection: published selections, each with its curated published wines; empty selections are hidden. */
  async publicSelections() {
    const { allCategories, items } = await this.publicCollection();
    return allCategories
      .filter((c) => c.selectionPublished)
      .map((c) => ({ ...c, wines: items.filter((p) => p.categoryId === c.id && p.curated) }))
      .filter((c) => c.wines.length > 0);
  }

  async findPublic(id: number) {
    const p = await this.products.findOne({ where: { id, published: true }, relations: { category: true } });
    if (!p || !p.category?.published) throw new NotFoundException('That wine isn’t in the collection.');
    return p;
  }

  /** Used by inquiries to validate the selected wine and snapshot its name. */
  async findPublishedName(id: number): Promise<string | null> {
    try {
      return (await this.findPublic(id)).name;
    } catch {
      return null;
    }
  }

  /* ---------- admin: categories ---------- */

  listCategories(search?: string) {
    const qb = this.cats.createQueryBuilder('c').loadRelationCountAndMap('c.productCount', 'c.products').orderBy('c.sortOrder', 'ASC').addOrderBy('c.id', 'ASC');
    if (search?.trim()) qb.andWhere('(LOWER(c.name) LIKE :q OR LOWER(c.blurb) LIKE :q)', { q: `%${search.trim().toLowerCase()}%` });
    return qb.getMany();
  }

  async findCategory(id: number) {
    const c = await this.cats.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Category not found.');
    return c;
  }

  private async uniqueSlug(name: string, ignoreId?: number) {
    const base = slugify(name) || 'category';
    let slug = base;
    for (let i = 2; ; i++) {
      const hit = await this.cats.findOne({ where: { slug } });
      if (!hit || hit.id === ignoreId) return slug;
      slug = `${base}-${i}`;
    }
  }

  async createCategory(dto: CreateCategoryDto) {
    const sortOrder = dto.sortOrder ?? (await this.cats.count());
    return this.cats.save(this.cats.create({ ...dto, tint: (dto.tint as Tint) ?? 'plain', slug: await this.uniqueSlug(dto.name), sortOrder }));
  }

  /** Slugs stay stable after creation so shared /wines?category= links keep working. */
  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const c = await this.findCategory(id);
    Object.assign(c, dto);
    return this.cats.save(c);
  }

  async setCategoryImage(id: number, url: string | null) {
    const c = await this.findCategory(id);
    removeUpload(c.imageUrl);
    c.imageUrl = url;
    return this.cats.save(c);
  }

  async removeCategory(id: number) {
    const c = await this.findCategory(id);
    const n = await this.products.count({ where: { categoryId: id } });
    if (n > 0) throw new BadRequestException({ statusCode: 400, message: `Move or delete the ${n} wine${n === 1 ? '' : 's'} in “${c.name}” first.`, errors: {} });
    removeUpload(c.imageUrl);
    await this.cats.remove(c);
    return { ok: true };
  }

  /* ---------- admin: products ---------- */

  listProducts(search?: string, categoryId?: string, status?: string) {
    const qb = this.products.createQueryBuilder('p').leftJoinAndSelect('p.category', 'c').orderBy('c.sortOrder', 'ASC').addOrderBy('p.sortOrder', 'ASC').addOrderBy('p.id', 'ASC');
    if (search?.trim()) qb.andWhere('(LOWER(p.name) LIKE :q OR LOWER(p.description) LIKE :q OR LOWER(p.region) LIKE :q OR LOWER(p.grapeVariety) LIKE :q)', { q: `%${search.trim().toLowerCase()}%` });
    if (categoryId && Number(categoryId)) qb.andWhere('p.categoryId = :cid', { cid: Number(categoryId) });
    if (status === 'published') qb.andWhere('p.published = 1');
    if (status === 'hidden') qb.andWhere('p.published = 0');
    if (status === 'sample') qb.andWhere('p.isSample = 1');
    if (status === 'featured') qb.andWhere('p.featured = 1');
    if (status === 'curated') qb.andWhere('p.curated = 1');
    return qb.getMany();
  }

  async findProduct(id: number) {
    const p = await this.products.findOne({ where: { id }, relations: { category: true } });
    if (!p) throw new NotFoundException('Wine not found.');
    return p;
  }

  private clean<T extends Partial<CreateProductDto>>(dto: T) {
    const out: Record<string, unknown> = { ...dto };
    for (const k of ['region', 'grapeVariety', 'details', 'tint'] as const) if (k in dto) out[k] = blankToNull(dto[k] as string | null);
    if (typeof dto.name === 'string') out.name = dto.name.trim();
    return out as Partial<Product>;
  }

  async createProduct(dto: CreateProductDto) {
    await this.findCategory(dto.categoryId);
    const sortOrder = dto.sortOrder ?? (await this.products.count({ where: { categoryId: dto.categoryId } }));
    const saved = await this.products.save(this.products.create({ ...this.clean(dto), sortOrder }));
    return this.findProduct(saved.id);
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const p = await this.findProduct(id);
    if (dto.categoryId) p.category = await this.findCategory(dto.categoryId);
    Object.assign(p, this.clean(dto));
    await this.products.save(p);
    return this.findProduct(id);
  }

  async setProductImage(id: number, url: string | null) {
    const p = await this.findProduct(id);
    removeUpload(p.imageUrl);
    p.imageUrl = url;
    await this.products.save(p);
    return this.findProduct(id);
  }

  async removeProduct(id: number) {
    const p = await this.findProduct(id);
    removeUpload(p.imageUrl);
    await this.products.remove(p);
    return { ok: true };
  }

  async counts() {
    const [total, samples, published, featured, noPhoto] = await Promise.all([
      this.products.count(), this.products.count({ where: { isSample: true } }), this.products.count({ where: { published: true } }),
      this.products.count({ where: { featured: true, published: true } }), this.products.createQueryBuilder('p').where('p.imageUrl IS NULL').getCount(),
    ]);
    return { total, samples, published, featured, noPhoto };
  }

  /* ---------- seed ---------- */

  async seed(categories: CategorySeed[], products: ProductSeed[], sampleDescription: string) {
    if ((await this.cats.count()) > 0) return;
    const saved = await this.cats.save(categories.map((c, i) => this.cats.create({ ...c, sortOrder: i })));
    const bySlug = new Map(saved.map((c) => [c.slug, c.id]));
    await this.products.save(
      products.map((p, i) => this.products.create({
        categoryId: bySlug.get(p.category)!, name: p.name, description: sampleDescription, imageAlt: p.imageAlt, tint: p.tint, featured: p.featured, isSample: true, sortOrder: i,
      })),
    );
  }
}
