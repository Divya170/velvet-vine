import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomBytes } from 'crypto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');
const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

export function imageUploadOptions(): MulterOptions {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  return {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
      },
    }),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!file.mimetype.startsWith('image/') || !ALLOWED.includes(ext)) {
        return cb(new BadRequestException('Upload a JPG, PNG, WebP or AVIF image (max 8 MB).'), false);
      }
      cb(null, true);
    },
  };
}

export function publicUrlFor(filename: string) {
  return `/uploads/${filename}`;
}

/** Remove a previously uploaded file when it is replaced or its record is deleted. */
export function removeUpload(url?: string | null) {
  if (!url || !url.startsWith('/uploads/')) return;
  const path = join(UPLOAD_DIR, url.replace('/uploads/', ''));
  try {
    if (existsSync(path)) unlinkSync(path);
  } catch {
    /* ignore */
  }
}

export function requireFile(file?: Express.Multer.File) {
  if (!file) throw new BadRequestException('Choose an image to upload.');
  return file;
}
