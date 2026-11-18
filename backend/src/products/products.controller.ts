import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { imageUploadOptions, publicUrlFor, requireFile } from '../common/upload';
import { CreateCategoryDto, CreateProductDto, UpdateCategoryDto, UpdateProductDto } from './dto/product.dto';
import { TINTS } from './product-category.entity';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get() all() { return this.products.publicCollection(); }

  @Get('featured')
  featured(@Query('limit') limit?: string) { return this.products.featured(Math.min(8, Math.max(1, Number(limit) || 4))); }

  @Get('selections') selections() { return this.products.publicSelections(); }

  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.products.findPublic(id); }
}

@Controller('admin/product-categories')
@UseGuards(JwtAuthGuard)
export class ProductCategoriesAdminController {
  constructor(private readonly products: ProductsService) {}

  @Get() list(@Query('search') search?: string) { return this.products.listCategories(search); }
  @Get('meta') meta() { return { tints: TINTS }; }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) { return this.products.findCategory(id); }
  @Post() create(@Body() dto: CreateCategoryDto) { return this.products.createCategory(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) { return this.products.updateCategory(id, dto); }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
  upload(@Param('id', ParseIntPipe) id: number, @UploadedFile() file?: Express.Multer.File) {
    return this.products.setCategoryImage(id, publicUrlFor(requireFile(file).filename));
  }

  @Delete(':id/image') clearImage(@Param('id', ParseIntPipe) id: number) { return this.products.setCategoryImage(id, null); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.products.removeCategory(id); }
}

@Controller('admin/products')
@UseGuards(JwtAuthGuard)
export class ProductsAdminController {
  constructor(private readonly products: ProductsService) {}

  @Get() list(@Query('search') search?: string, @Query('categoryId') categoryId?: string, @Query('status') status?: string) { return this.products.listProducts(search, categoryId, status); }
  @Get('counts') counts() { return this.products.counts(); }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) { return this.products.findProduct(id); }
  @Post() create(@Body() dto: CreateProductDto) { return this.products.createProduct(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) { return this.products.updateProduct(id, dto); }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions()))
  upload(@Param('id', ParseIntPipe) id: number, @UploadedFile() file?: Express.Multer.File) {
    return this.products.setProductImage(id, publicUrlFor(requireFile(file).filename));
  }

  @Delete(':id/image') clearImage(@Param('id', ParseIntPipe) id: number) { return this.products.setProductImage(id, null); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.products.removeProduct(id); }
}
