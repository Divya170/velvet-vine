import { Body, Controller, Delete, Get, Header, Ip, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateInquiryDto, ListInquiriesQuery, UpdateInquiryDto } from './dto/inquiry.dto';
import { InquiriesService } from './inquiries.service';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  create(@Body() dto: CreateInquiryDto, @Ip() ip: string) {
    return this.inquiries.create(dto, ip);
  }
}

@Controller('admin/inquiries')
@UseGuards(JwtAuthGuard)
export class InquiriesAdminController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Get()
  list(@Query() q: ListInquiriesQuery) {
    return this.inquiries.list(q);
  }

  @Get('stats')
  stats() {
    return this.inquiries.stats();
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="velvet-vine-inquiries.csv"')
  export(@Query() q: ListInquiriesQuery) {
    return this.inquiries.exportCsv(q);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.inquiries.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInquiryDto) {
    return this.inquiries.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inquiries.remove(id);
  }
}
