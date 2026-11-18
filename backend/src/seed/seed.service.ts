import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { ContentService } from '../content/content.service';
import { GalleryService } from '../gallery/gallery.service';
import { ProductsService } from '../products/products.service';
import { SettingsService } from '../settings/settings.service';
import { CATEGORY_SEED, CONTENT_SEED, GALLERY_SEED, PRODUCT_SEED, SAMPLE_DESCRIPTION } from './seed-data';

/** Idempotent first-boot seed: each collection is filled only when it is empty. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Seed');

  constructor(
    private readonly admin: AdminAuthService,
    private readonly settings: SettingsService,
    private readonly content: ContentService,
    private readonly products: ProductsService,
    private readonly gallery: GalleryService,
  ) {}

  async onApplicationBootstrap() {
    await this.settings.seed();
    await this.content.seed(CONTENT_SEED);
    await this.products.seed(CATEGORY_SEED, PRODUCT_SEED, SAMPLE_DESCRIPTION);
    await this.gallery.seed(GALLERY_SEED);
    await this.admin.seedDefaultAdmin();
    this.logger.log('Seed check complete.');
  }
}
