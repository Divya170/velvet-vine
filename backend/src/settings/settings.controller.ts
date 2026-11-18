import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings')
  getPublic() {
    return this.settings.getPublic();
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard)
  getAdmin() {
    return this.settings.getAdmin();
  }

  @Put('admin/settings')
  @UseGuards(JwtAuthGuard)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
