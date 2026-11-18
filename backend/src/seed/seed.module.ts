import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { ContentModule } from '../content/content.module';
import { GalleryModule } from '../gallery/gallery.module';
import { ProductsModule } from '../products/products.module';
import { SettingsModule } from '../settings/settings.module';
import { SeedService } from './seed.service';

@Module({
  imports: [AdminAuthModule, SettingsModule, ContentModule, ProductsModule, GalleryModule],
  providers: [SeedService],
})
export class SeedModule {}
