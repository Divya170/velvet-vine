import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiriesAdminController, InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { Inquiry } from './inquiry.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry]), ProductsModule],
  controllers: [InquiriesController, InquiriesAdminController],
  providers: [InquiriesService],
})
export class InquiriesModule {}
