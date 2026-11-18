import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { imageUploadOptions, publicUrlFor, requireFile } from '../common/upload';
import { CreateGalleryItemDto, UpdateGalleryItemDto } from './dto/gallery.dto';
import { GalleryCategory } from './gallery-item.entity';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Get()
  list(@Query('category') category?: string) {
    return this.gallery.listPublic(category);
  }

  @Get('home')
  home() {
    return this.gallery.homePreview();
  }

  @Get('strip')
  strip() {
    return this.gallery.strip();
  }
}

@Controller('admin/gallery')
@UseGuards(JwtAuthGuard)
export class GalleryAdminController {
  constructor(private readonly gallery: GalleryService) {}

  @Get()
  list(@Query('search') search?: string, @Query('category') category?: GalleryCategory) {
    return this.gallery.listAdmin(search, category);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.gallery.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGalleryItemDto) {
    return this.gallery.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGalleryItemDto) {
    return this.gallery.update(id, dto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
  upload(@Param('id', ParseIntPipe) id: number, @UploadedFile() file?: Express.Multer.File) {
    return this.gallery.setImage(id, publicUrlFor(requireFile(file).filename));
  }

  @Delete(':id/image')
  clearImage(@Param('id', ParseIntPipe) id: number) {
    return this.gallery.setImage(id, null);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gallery.remove(id);
  }
}
