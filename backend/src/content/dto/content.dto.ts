import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { CONTENT_TYPES, ContentType } from '../content-block.entity';

export class CreateContentDto {
  @IsIn(CONTENT_TYPES as unknown as string[], { message: 'Unknown content type.' })
  type: ContentType;

  @IsOptional() @IsString() @MaxLength(80) key?: string | null;

  @IsString() @IsNotEmpty({ message: 'Add a title.' }) @MaxLength(200) title: string;

  @IsOptional() @IsString() @MaxLength(5000) body?: string | null;

  @IsOptional() @IsObject() fields?: Record<string, string | null>;

  @IsOptional() @IsInt() sortOrder?: number;

  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateContentDto extends PartialType(CreateContentDto) {}

export class ReorderDto {
  @IsInt({ each: true }) ids: number[];
}
