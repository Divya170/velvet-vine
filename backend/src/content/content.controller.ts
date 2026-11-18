import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { imageUploadOptions, publicUrlFor, requireFile } from '../common/upload';
import { ContentType } from './content-block.entity';
import { ContentService } from './content.service';
import { CreateContentDto, ReorderDto, UpdateContentDto } from './dto/content.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  list(@Query('type') type?: ContentType) {
    return this.content.listPublic(type);
  }

  @Get('page-copy')
  pageCopy() {
    return this.content.pageCopy();
  }
}

@Controller('admin/content')
@UseGuards(JwtAuthGuard)
export class ContentAdminController {
  constructor(private readonly content: ContentService) {}

  @Get()
  list(@Query('type') type?: ContentType, @Query('search') search?: string) {
    return this.content.listAdmin(type, search);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.content.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateContentDto) {
    return this.content.create(dto);
  }

  @Put('reorder')
  reorder(@Body() dto: ReorderDto) {
    return this.content.reorder(dto.ids);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContentDto) {
    return this.content.update(id, dto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
  upload(@Param('id', ParseIntPipe) id: number, @UploadedFile() file?: Express.Multer.File, @Query('slot') slot?: string) {
    return this.content.setImage(id, publicUrlFor(requireFile(file).filename), slot);
  }

  @Delete(':id/image')
  clearImage(@Param('id', ParseIntPipe) id: number, @Query('slot') slot?: string) {
    return this.content.setImage(id, null, slot);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.content.remove(id);
  }
}
