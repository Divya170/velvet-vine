import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { CommonModule } from './common/common.module';
import { ContentModule } from './content/content.module';
import { GalleryModule } from './gallery/gallery.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { ProductsModule } from './products/products.module';
import { SeedModule } from './seed/seed.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const database = resolve(process.cwd(), config.get<string>('DATABASE_PATH') || '../database/app.sqlite');
        if (!existsSync(dirname(database))) mkdirSync(dirname(database), { recursive: true });
        return {
          type: 'sqlite' as const,
          database,
          autoLoadEntities: true,
          // Schema is created/updated from the entities. For a long-lived production DB, switch to migrations.
          synchronize: true,
        };
      },
    }),
    CommonModule,
    AdminAuthModule,
    SettingsModule,
    ContentModule,
    ProductsModule,
    GalleryModule,
    InquiriesModule,
    SeedModule,
  ],
})
export class AppModule {}
