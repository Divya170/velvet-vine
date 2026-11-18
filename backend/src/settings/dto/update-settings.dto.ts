import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min, ValidateIf, ValidateNested,
} from 'class-validator';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class DayHoursDto {
  @IsString() @IsNotEmpty() day: string;
  @IsOptional() @ValidateIf((_o: unknown, v: unknown) => v !== null && v !== '') @Matches(TIME, { message: 'Use a 24-hour time like 08:30.' }) open: string | null;
  @IsOptional() @ValidateIf((_o: unknown, v: unknown) => v !== null && v !== '') @Matches(TIME, { message: 'Use a 24-hour time like 21:00.' }) close: string | null;
  @IsBoolean() closed: boolean;
}

export class SocialLinkDto {
  @IsString() @IsNotEmpty({ message: 'Add a label, e.g. Instagram.' }) @MaxLength(40) label: string;
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'Use the full https:// link to the official profile.' }) url: string;
}

export class UpdateSettingsDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) businessName?: string;
  @IsOptional() @IsString() @MaxLength(120) tagline?: string;
  @IsOptional() @IsString() @MaxLength(160) addressLine1?: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsOptional() @IsString() @MaxLength(40) region?: string;
  @IsOptional() @IsString() @MaxLength(20) postalCode?: string;
  @IsOptional() @IsString() @MaxLength(60) country?: string;

  @IsOptional() @ValidateIf((_o: unknown, v: unknown) => v !== null && v !== '') @IsString() @MaxLength(40) phone?: string | null;
  @IsOptional() @IsBoolean() phoneVerified?: boolean;
  @IsOptional() @ValidateIf((_o: unknown, v: unknown) => v !== null && v !== '') @IsEmail({}, { message: 'Enter a valid email address.' }) email?: string | null;

  @IsOptional()
  @ValidateIf((_o: unknown, v: unknown) => v !== null && v !== '')
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'Use a full https:// Google Maps embed URL.' })
  mapEmbedUrl?: string | null;

  @IsOptional() @IsBoolean() heroAutoplay?: boolean;
  @IsOptional() @IsInt() @Min(6, { message: 'Use 6–8 seconds between hero photos.' }) @Max(8, { message: 'Use 6–8 seconds between hero photos.' }) heroIntervalSeconds?: number;
  @IsOptional() @IsInt() @Min(5, { message: 'Use 5–8 seconds per step.' }) @Max(8, { message: 'Use 5–8 seconds per step.' }) galleryStripSeconds?: number;


  @IsOptional() @IsBoolean() ageGateEnabled?: boolean;
  @IsOptional() @IsInt() @Min(18, { message: 'Use an age between 18 and 25.' }) @Max(25, { message: 'Use an age between 18 and 25.' }) minimumAge?: number;

  @IsOptional() @IsArray() @ArrayMaxSize(7) @ValidateNested({ each: true }) @Type(() => DayHoursDto) hours?: DayHoursDto[];
  @IsOptional() @IsBoolean() hoursVerified?: boolean;

  @IsOptional() @IsArray() @ArrayMaxSize(8) @ValidateNested({ each: true }) @Type(() => SocialLinkDto) socialLinks?: SocialLinkDto[];
  @IsOptional() @IsString() @MaxLength(200) footerNote?: string;
}
