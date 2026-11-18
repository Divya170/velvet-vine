export interface DayHoursDisplay { day: string; label: string; confirmed: boolean; isToday: boolean }
export interface DayHours { day: string; open: string | null; close: string | null; closed: boolean }
export interface SocialLink { label: string; url: string }

export interface SiteSettings {
  id: number;
  businessName: string;
  tagline: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string | null;
  phoneVerified: boolean;
  email: string | null;
  mapEmbedUrl: string | null;
  heroAutoplay: boolean;
  heroIntervalSeconds: number;
  galleryStripSeconds: number;
  ageGateEnabled: boolean;
  minimumAge: number;
  hours: DayHours[];
  hoursVerified: boolean;
  hoursDisplay: DayHoursDisplay[];
  openStatus: { isOpen: boolean; label: string } | null;
  socialLinks: SocialLink[];
  footerNote: string;
  fullAddress: string;
  phoneHref: string | null;
  emailHref: string | null;
  mapsUrl: string;
  directionsUrl: string;
}

export type ContentType = 'page_copy' | 'hero_slide' | 'experience_item' | 'philosophy_item' | 'store_point';

export interface ContentBlock {
  id: number;
  type: ContentType;
  key: string | null;
  title: string;
  body: string | null;
  fields: Record<string, string | null>;
  sortOrder: number;
  published: boolean;
  imageUrl?: string | null;
}

export type PageCopy = Record<string, ContentBlock | undefined>;
export type Tint = 'plain' | 'dark' | 'cream' | 'rose' | 'gold' | 'char';

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  shortName: string;
  blurb: string;
  selectionTitle: string;
  selectionBody: string;
  selectionPublished: boolean;
  imageUrl: string | null;
  imageAlt: string;
  tint: Tint;
  sortOrder: number;
  published: boolean;
  count?: number;
  productCount?: number;
}

export interface Product {
  id: number;
  categoryId: number;
  category?: ProductCategory;
  name: string;
  description: string;
  region: string | null;
  grapeVariety: string | null;
  details: string | null;
  imageUrl: string | null;
  imageAlt: string;
  tint: Tint | null;
  featured: boolean;
  curated: boolean;
  isSample: boolean;
  sortOrder: number;
  published: boolean;
}

export interface CollectionResponse {
  categories: (ProductCategory & { count: number })[];
  allCategories: (ProductCategory & { count: number })[];
  items: Product[];
  total: number;
}

export type Selection = ProductCategory & { count: number; wines: Product[] };

export type GalleryCategory = 'Boutique Interior' | 'Wine Shelves' | 'Bottle Displays' | 'Product Photography' | 'Store Details' | 'Atmosphere';

export interface GalleryItem {
  id: number;
  title: string;
  category: GalleryCategory;
  imageUrl: string | null;
  alt: string;
  rows: number;
  cols: number;
  tint: Tint;
  inStrip: boolean;
  featuredOnHome: boolean;
  sortOrder: number;
  published: boolean;
}

export interface GalleryResponse {
  category: string;
  categories: { name: string; count: number }[];
  items: GalleryItem[];
}

export type InquirySubject = 'general' | 'availability' | 'collection' | 'visit' | 'other';
export type InquirySource = 'contact' | 'product';
export type InquiryStatus = 'new' | 'responded' | 'archived';

export interface Inquiry {
  id: number;
  reference: string;
  source: InquirySource;
  subject: InquirySubject;
  name: string;
  email: string;
  phone: string | null;
  productId: number | null;
  productName: string | null;
  message: string;
  status: InquiryStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** What the API returns after a message is stored. */
export interface InquiryReceipt {
  received: true;
  source: InquirySource;
  subject: InquirySubject;
  subjectLabel: string;
  productName: string | null;
  name: string;
  email: string;
  hasPhone: boolean;
  createdAt: string;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  errors?: Record<string, string>;
}
