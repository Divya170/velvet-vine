import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { fieldErrors } from '../common/validation';
import { AdminUser } from './admin-user.entity';
import { ChangePasswordDto, LoginDto } from './dto/login.dto';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger('AdminAuth');

  constructor(
    @InjectRepository(AdminUser) private readonly users: Repository<AdminUser>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async seedDefaultAdmin() {
    if ((await this.users.count()) > 0) return;
    const email = (this.config.get<string>('ADMIN_EMAIL') || 'admin@velvetvine.local').toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD') || 'VelvetVine!2026';
    await this.users.save(this.users.create({ email, name: 'Administrator', passwordHash: await bcrypt.hash(password, 10) }));
    this.logger.warn('──────────────────────────────────────────────');
    this.logger.warn('Default admin account created');
    this.logger.warn(`  Email:    ${email}`);
    this.logger.warn(`  Password: ${password}`);
    this.logger.warn('Sign in at /admin/login and change it in Settings.');
    this.logger.warn('──────────────────────────────────────────────');
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('That email and password don’t match.');
    }
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { accessToken, admin: { id: user.id, email: user.email, name: user.name } };
  }

  async me(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Admin not found.');
    return { id: user.id, email: user.email, name: user.name };
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Admin not found.');
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw fieldErrors({ currentPassword: 'Your current password is incorrect.' });
    }
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.users.save(user);
    return { ok: true };
  }
}
