import { Allow, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { INQUIRY_SOURCES, INQUIRY_STATUSES, INQUIRY_SUBJECTS, InquirySource, InquiryStatus, InquirySubject } from '../inquiry.entity';

/** Presence only — the rules live in InquiriesService.validate() so messages match the site exactly. */
export class CreateInquiryDto {
  /** "contact" (Contact page) or "product" (a wine card's inquiry dialog). */
  @Allow() source?: string;
  @Allow() name?: string;
  @Allow() email?: string;
  @Allow() phone?: string | null;
  @Allow() subject?: string | null;
  /** A published wine's id (required in the wine dialog, optional on the Contact page). */
  @Allow() product?: string | number | null;
  @Allow() message?: string;
  /** Honeypot: real visitors never see or fill this. */
  @Allow() website?: string;
}

export class UpdateInquiryDto {
  @IsOptional() @IsIn(INQUIRY_STATUSES as unknown as string[], { message: 'Choose New, Responded or Archived.' }) status?: InquiryStatus;
  @IsOptional() @IsString() @MaxLength(4000) adminNotes?: string | null;
}

export class ListInquiriesQuery {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn([...INQUIRY_STATUSES, 'all']) status?: InquiryStatus | 'all';
  @IsOptional() @IsIn([...INQUIRY_SUBJECTS, 'all']) subject?: InquirySubject | 'all';
  @IsOptional() @IsIn([...INQUIRY_SOURCES, 'all']) source?: InquirySource | 'all';
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() pageSize?: string;
  @IsOptional() @IsIn(['newest', 'oldest']) sort?: 'newest' | 'oldest';
}
