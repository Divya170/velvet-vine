import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryItem } from './gallery-item.entity';
import { GalleryAdminController, GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryItem])],
  controllers: [GalleryController, GalleryAdminController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
