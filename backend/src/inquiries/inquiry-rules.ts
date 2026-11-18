/**
 * Pure validation for both forms (no Nest/TypeORM imports, so it can be unit-tested directly).
 * Rules and messages mirror the design's form.js exactly (see DATA-MODEL.md).
 */
import type { InquirySource, InquirySubject } from './inquiry.entity';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUBJECTS = ['general', 'availability', 'collection', 'visit', 'other'];
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export interface InquiryInput { source?: unknown; name?: unknown; email?: unknown; phone?: unknown; subject?: unknown; product?: unknown; message?: unknown }

export function validateInquiry(dto: InquiryInput) {
  const e: Record<string, string> = {};
  const source: InquirySource = str(dto.source) === 'product' ? 'product' : 'contact';
  const name = str(dto.name).trim();
  const email = str(dto.email).trim();
  const phone = str(dto.phone).trim();
  const message = str(dto.message).trim();
  const productRaw = str(dto.product).trim();
  let subject = str(dto.subject).trim() as InquirySubject;

  if (name.length < 2) e.name = 'Please enter your full name.';
  else if (name.length > 120) e.name = 'Please keep your name under 120 characters.';
  if (!email) e.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(email) || email.length > 160) e.email = 'Enter an email address like name@example.com.';
  const digits = phone.replace(/\D/g, '');
  if (phone && (digits.length < 10 || digits.length > 15)) e.phone = 'Enter a phone number with 10 to 15 digits, or leave it blank.';

  let productId: number | null = null;
  if (source === 'product') {
    // A wine card's "Ask About This Wine" dialog: a wine is required (form.js: needType = false);
    // "general" = "Not sure yet / general question" and is filed as Collection Information.
    if (!productRaw) e.product = 'Choose the wine you’re asking about.';
    else if (productRaw !== 'general') {
      const n = Number(productRaw);
      if (!Number.isInteger(n) || n < 1) e.product = 'Choose the wine you’re asking about.';
      else productId = n;
    }
    subject = productId ? 'availability' : 'collection';
  } else {
    // Contact page: Inquiry Type is required; Product of Interest is optional.
    if (!SUBJECTS.includes(subject)) e.subject = 'Choose the type of inquiry.';
    if (productRaw) {
      const n = Number(productRaw);
      if (!Number.isInteger(n) || n < 1) e.product = 'That wine is no longer in the collection. Choose another, or leave it blank.';
      else productId = n;
    }
  }

  if (message.length < 10) e.message = 'Please write a short message (at least 10 characters).';
  else if (message.length > 1500) e.message = 'Please keep your message under 1,500 characters.';

  return { errors: e, clean: { source, subject, name, email, phone: phone || null, productId, message } };
}
