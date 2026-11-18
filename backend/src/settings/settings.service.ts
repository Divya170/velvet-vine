import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fieldErrors } from '../common/validation';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { defaultHours, displayHours, nowIn, openStatus } from './hours';
import { DAYS, Settings } from './settings.entity';

export function telHref(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings) private readonly repo: Repository<Settings>,
    private readonly config: ConfigService,
  ) {}

  timeZone() {
    return this.config.get<string>('SHOP_TIMEZONE') || 'America/Los_Angeles';
  }

  async get(): Promise<Settings> {
    let s = await this.repo.findOne({ where: { id: 1 } });
    if (!s) s = await this.repo.save(this.repo.create({ id: 1, hours: defaultHours() }));
    return s;
  }

  /** Public view adds ready-to-use links, display hours and a verified-only open-now status. */
  async getPublic() {
    const s = await this.get();
    const fullAddress = `${s.addressLine1}, ${s.city}, ${s.region} ${s.postalCode}, ${s.country}`;
    const q = encodeURIComponent(fullAddress);
    return {
      ...s,
      fullAddress,
      phoneHref: telHref(s.phone),
      emailHref: s.email ? `mailto:${s.email}` : null,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
      hoursDisplay: displayHours(s.hours, s.hoursVerified).map((h, i) => ({ ...h, isToday: i === nowIn(this.timeZone()).dayIdx })),
      openStatus: openStatus(s.hours, s.hoursVerified, this.timeZone()),
    };
  }

  async getAdmin() {
    return this.getPublic();
  }

  async update(dto: UpdateSettingsDto) {
    const s = await this.get();
    const patch: Partial<Settings> = { ...dto } as Partial<Settings>;
    for (const k of ['phone', 'email', 'mapEmbedUrl'] as const) {
      if (patch[k] === '') patch[k] = null;
    }
    if (dto.hours) {
      patch.hours = DAYS.map((day) => {
        const h = dto.hours!.find((x) => x.day === day);
        return { day, open: h?.open || null, close: h?.close || null, closed: !!h?.closed };
      });
    }
    const next = { ...s, ...patch };
    const errors: Record<string, string> = {};
    if (next.hoursVerified) {
      const missing = next.hours.filter((h) => !h.closed && (!h.open || !h.close)).map((h) => h.day);
      if (missing.length) errors.hours = `Add opening and closing times (or mark closed) for ${missing.join(', ')} before marking hours as verified.`;
    }
    if (Object.keys(errors).length) throw fieldErrors(errors);
    Object.assign(s, patch);
    await this.repo.save(s);
    return this.getAdmin();
  }

  async seed() {
    if (await this.repo.findOne({ where: { id: 1 } })) return;
    await this.repo.save(this.repo.create({ id: 1, phone: '+1 (735) 918-5261', email: 'velvetvine@gmail.com', hours: defaultHours() }));
  }
}
