import { ContentBlock } from '../content/content-block.entity';
import { GalleryItem } from '../gallery/gallery-item.entity';
import type { CategorySeed, ProductSeed } from '../products/products.service';

/**
 * Seed copy taken verbatim from the design (design-source/*.dc.html). See DATA-MODEL.md.
 * Words wrapped in *asterisks* render in the italic burgundy accent, as in the design.
 * fields.clientNote renders as a dashed "Client to supply" note until cleared in the admin.
 * Nothing here invents wine names, prices, regions, grapes, tasting notes, awards, history, hours or statistics.
 */
type F = Record<string, string | null>;
const pc = (key: string, title: string, body: string | null, fields: F = {}): Partial<ContentBlock> => ({ type: 'page_copy', key, title, body, fields });
const item = (type: ContentBlock['type'], title: string, body: string, fields: F, sortOrder: number): Partial<ContentBlock> => ({ type, title, body, fields, sortOrder });

export const CONTENT_SEED: Partial<ContentBlock>[] = [
  // Home
  pc('home_hero', 'Discover the Art of *Fine Wine.*', 'An intimate wine destination for discovering thoughtfully presented selections and experiencing the character of every bottle.', {
    eyebrow: 'Wine boutique · Ventura, California', cta: 'Explore Our Collection', cta2: 'Visit Our Boutique',
  }),
  pc('home_intro', 'A Little More Than a *Wine Shop.*', 'Velvet Vine is a boutique in Ventura created for discovering wine: browsing carefully presented bottles, comparing styles, and enjoying the quiet pleasure of choosing something special.', {
    eyebrow: 'Velvet Vine', body2: 'Come in, take your time, and find a bottle with character.', cta: 'Discover Our Story',
    imageUrl: null, alt: 'Wine glasses and bottles in soft evening light', image2Url: null, alt2: 'Pouring a glass', side: 'Ventura · California',
    clientNote: 'A short introduction in Megan Morgan’s own words. Founding year, history, awards and statistics are deliberately left out until supplied.',
  }),
  pc('home_categories', 'Begin with *a style.*', null, {
    eyebrow: 'Wine categories', clientNote: 'Illustrative categories for the design. On the live site, a category appears only when the boutique has wines in it.',
  }),
  pc('home_featured', 'Bottles worth *a closer look.*', null, {
    eyebrow: 'Featured collection', cta: 'Explore Wine Collection', clientNote: 'Real wines, bottle photography and details. These are clearly marked samples: no wine names, prices, regions, grape varieties or tasting notes are invented.',
  }),
  pc('home_experience', 'Find Your Next *Favourite Bottle.*', 'Some wines are best discovered in person. Visit the boutique to browse, compare and choose in an unhurried, welcoming setting.', {
    eyebrow: 'The Velvet Vine experience', cta: 'Plan Your Visit',
    imageUrl: null, alt: 'The boutique at golden hour', image2Url: null, alt2: 'Hand selecting a bottle from the shelf', image3Url: null, alt3: 'Glasses on a marble counter',
  }),
  pc('home_gallery', 'Inside *the boutique.*', null, { eyebrow: 'Gallery', cta: 'Explore the Gallery' }),
  pc('home_visit', 'Come in and *browse.*', null, { eyebrow: 'Visit Velvet Vine', imageUrl: null, alt: 'The boutique entrance on Cherry Lane' }),

  // Wine Collection
  pc('wines_hero', 'Explore Our *Wine Collection.*', 'Browse by style, learn a little about each bottle, and ask the boutique about anything that catches your eye. Wines are available in store only.', {
    eyebrow: 'The catalogue', imageUrl: null, alt: 'Bottles arranged along a wooden wine wall',
    clientNote: 'The real wine list. Every sample card is clearly marked: no wine names, prices, regions, grape varieties or tasting notes are invented, and no bottle shown is presented as real stock.',
  }),
  pc('wines_talk', 'Ask the boutique *directly.*', 'Questions about a bottle, availability or something you’re looking for? Call or email, or visit us on Cherry Lane.', { eyebrow: 'Prefer to talk?' }),

  // About
  pc('about_hero', 'The Story Behind *Velvet Vine.*', null, { eyebrow: 'About Velvet Vine', imageUrl: null, alt: 'The boutique, seen from the entrance' }),
  pc('about_story', 'A boutique built around *discovery.*', 'Velvet Vine is a wine boutique on Cherry Lane in Ventura, California, created for people who enjoy discovering wine, whether they know exactly what they’re looking for or simply want to explore.', {
    eyebrow: 'Our story',
    body2: 'The boutique is about presentation and appreciation: wines arranged with care, room to browse, and the chance to ask about any bottle that catches your eye.',
    extra: '[Editable placeholder: a few sentences, in Megan Morgan’s own words, about why Velvet Vine exists and what makes the collection personal.]',
    quote: 'Every bottle has a character worth discovering.', quoteNote: 'Brand line · to be approved',
    clientNote: 'The brand story. Founding year, founder biography, history, awards, partnerships and customer numbers appear only if Velvet Vine supplies and verifies them.',
  }),
  pc('about_philosophy', 'Four quiet *principles.*', null, { eyebrow: 'Our philosophy', clientNote: 'Design themes describing the boutique’s outlook, not operational or service claims.' }),
  pc('about_store', 'Step inside *Velvet Vine.*', 'Warm light, carefully arranged shelves and space to linger. The boutique is designed for browsing at your own pace, comparing bottles, and finding something you’ll look forward to opening.', {
    eyebrow: 'The store experience', cta: 'Visit Velvet Vine',
    imageUrl: null, alt: 'Wine shelves along the boutique wall', image2Url: null, alt2: 'A bottle on display, close up', image3Url: null, alt3: 'Glassware detail',
  }),

  // Our Collection
  pc('selections_hero', 'Selected With *Character.*', 'A more personal way to explore the boutique: wines gathered into small selections by style, each with its own mood and occasion.', {
    imageUrl: null, alt: 'A curated row of bottles, side light',
    clientNote: 'Selections are built from the boutique’s real inventory. A selection is published only when Velvet Vine stocks that style. Wines listed are clearly marked samples.',
  }),
  pc('selections_details', 'A closer look at *each bottle.*', 'Choose a wine to see its details. Region, grape and description appear here once the boutique supplies them.', { eyebrow: 'Wine details' }),
  pc('selections_cta', 'Something Caught *Your Eye?*', 'Ask about a specific bottle, its availability, or what to expect when you visit. The boutique will be glad to help.', { eyebrow: 'Inquiries' }),

  // Gallery
  pc('gallery_hero', 'A Glimpse Inside *Velvet Vine.*', null, {
    imageUrl: null, alt: 'The boutique interior, evening light',
    clientNote: 'Genuine photographs of the boutique, its shelves and displays. Every panel here is an illustrative placeholder, and none is presented as a real photo of Velvet Vine.',
  }),
  pc('gallery_strip', 'Moments from *the boutique.*', null, { eyebrow: 'Featured' }),
  pc('gallery_grid', 'Shelves, glasses *& quiet details.*', null, { eyebrow: 'The gallery' }),
  pc('gallery_cta', 'See it *in person.*', null, { eyebrow: 'Visit us' }),

  // Contact
  pc('contact_hero', 'We’d Love to *Welcome You.*', 'Questions about a wine, its availability or planning a visit? Call, email or send a message, and the boutique will be glad to help.'),
  pc('contact_form', 'How can we *help?*', null, { eyebrow: 'Send an inquiry' }),
  pc('contact_location', 'Find us on *Cherry Lane.*', null, { eyebrow: 'Location' }),

  // Hero photos (placeholders until real photographs are uploaded)
  item('hero_slide', 'Wine bottles on a boutique shelf, warm light', '', { imageUrl: null, tint: 'dark' }, 0),
  item('hero_slide', 'Red wine poured into a glass', '', { imageUrl: null, tint: 'plain' }, 1),
  item('hero_slide', 'The boutique interior at dusk', '', { imageUrl: null, tint: 'char' }, 2),

  // Home experience highlights
  item('experience_item', 'Discover at your own pace', 'Browse the shelves, compare bottles and take your time.', { icon: 'compass' }, 0),
  item('experience_item', 'Thoughtfully presented', 'Wines arranged so their character is easy to explore.', { icon: 'bottle' }, 1),
  item('experience_item', 'A boutique atmosphere', 'An intimate space designed around wine and conversation.', { icon: 'door' }, 2),
  item('experience_item', 'Ask about any bottle', 'Questions are always welcome, in store or before you visit.', { icon: 'glass' }, 3),

  // About principles
  item('philosophy_item', 'Thoughtful Selection', 'Every bottle on the shelf is there for a reason, presented so its character is easy to understand.', { icon: 'grape', numeral: 'I' }, 0),
  item('philosophy_item', 'Wine Discovery', 'Exploring something new is half the pleasure. Familiar favourites sit alongside bottles waiting to be found.', { icon: 'compass', numeral: 'II' }, 1),
  item('philosophy_item', 'The Boutique Experience', 'A calm, intimate space where browsing feels unhurried and questions are always welcome.', { icon: 'door', numeral: 'III' }, 2),
  item('philosophy_item', 'Appreciation of Craft', 'Respect for the care that goes into every bottle, from the vineyard to the glass.', { icon: 'glass', numeral: 'IV' }, 3),

  // About store points
  item('store_point', 'Wines presented by style', '', { icon: 'bottle' }, 0),
  item('store_point', 'Room to browse and compare', '', { icon: 'compass' }, 1),
  item('store_point', 'Questions always welcome', '', { icon: 'glass' }, 2),
];

/** Illustrative styles from the brief, with general (not inventory-specific) descriptions and the Our Collection selection copy. */
export const CATEGORY_SEED: CategorySeed[] = [
  {
    slug: 'red', name: 'Red Wines', shortName: 'Red', blurb: 'Deep, structured and expressive.', tint: 'dark', imageAlt: 'Red wines — selection photograph',
    selectionTitle: 'Red Wine *Selection.*', selectionBody: 'Reds with depth and structure, for long dinners, cool evenings and bottles worth opening slowly.',
  },
  {
    slug: 'white', name: 'White Wines', shortName: 'White', blurb: 'Bright, crisp and aromatic.', tint: 'cream', imageAlt: 'White wines — selection photograph',
    selectionTitle: 'White Wine *Selection.*', selectionBody: 'Bright, crisp and aromatic whites for warm afternoons, coastal days and lighter meals.',
  },
  {
    slug: 'rose', name: 'Rosé Wines', shortName: 'Rosé', blurb: 'Pale, fresh and quietly elegant.', tint: 'rose', imageAlt: 'Rosé wines — selection photograph',
    selectionTitle: 'Rosé *Highlights.*', selectionBody: 'Pale, fresh and quietly elegant. Rosé for long lunches and golden-hour conversations.',
  },
  {
    slug: 'sparkling', name: 'Sparkling Wines', shortName: 'Sparkling', blurb: 'Fine bubbles for any occasion.', tint: 'gold', imageAlt: 'Sparkling wines — selection photograph',
    selectionTitle: 'Sparkling *Selections.*', selectionBody: 'Fine bubbles for celebrations, toasts and evenings that deserve a little ceremony.',
  },
];

/** Clearly identified SAMPLE placeholders, exactly as in the design: no real names, regions, grapes, notes or prices. */
export const SAMPLE_DESCRIPTION = 'Placeholder for one of the boutique’s wines. Name, region, grape variety and description to be supplied by Velvet Vine.';
export const PRODUCT_SEED: ProductSeed[] = [
  { category: 'red', name: 'Sample Red Wine No. 1', imageAlt: 'Red wine bottle', tint: 'dark', featured: true },
  { category: 'white', name: 'Sample White Wine No. 1', imageAlt: 'White wine bottle', tint: 'cream', featured: true },
  { category: 'sparkling', name: 'Sample Sparkling Wine No. 1', imageAlt: 'Sparkling wine bottle', tint: 'gold', featured: true },
  { category: 'rose', name: 'Sample Rosé No. 1', imageAlt: 'Rosé wine bottle', tint: 'rose', featured: true },
  { category: 'red', name: 'Sample Red Wine No. 2', imageAlt: 'Red wine bottle', tint: 'plain', featured: false },
  { category: 'white', name: 'Sample White Wine No. 2', imageAlt: 'White wine bottle', tint: 'cream', featured: false },
  { category: 'red', name: 'Sample Red Wine No. 3', imageAlt: 'Red wine bottle', tint: 'char', featured: false },
  { category: 'sparkling', name: 'Sample Sparkling Wine No. 2', imageAlt: 'Sparkling wine bottle', tint: 'gold', featured: false },
];

const g = (category: string, title: string, rows: number, cols: number, tint: string, extra: Partial<GalleryItem> = {}) => ({ category, title, rows, cols, tint, ...extra }) as Partial<GalleryItem>;
/** Order, tile sizes, strip picks and tints exactly as in the design's Gallery page. */
export const GALLERY_SEED: Partial<GalleryItem>[] = [
  g('Boutique Interior', 'The boutique floor (awaiting genuine photo)', 3, 2, 'char', { inStrip: true, featuredOnHome: true }),
  g('Wine Shelves', 'Floor-to-ceiling wine wall', 2, 1, 'dark', { inStrip: true, featuredOnHome: true }),
  g('Product Photography', 'Bottle against a cream backdrop', 2, 1, 'cream', { featuredOnHome: true }),
  g('Atmosphere', 'Poured red, candlelight', 2, 1, 'plain', { featuredOnHome: true }),
  g('Bottle Displays', 'Featured bottles on a marble plinth', 2, 1, 'gold', { inStrip: true, featuredOnHome: true }),
  g('Store Details', 'Brass shelf label holders', 1, 1, 'gold'),
  g('Wine Shelves', 'Bottles stored on their side', 2, 2, 'dark'),
  g('Atmosphere', 'Two glasses at dusk', 2, 1, 'rose', { inStrip: true, featuredOnHome: true }),
  g('Product Photography', 'Close-up: capsule and cork', 2, 1, 'char'),
  g('Boutique Interior', 'Tasting counter (awaiting genuine photo)', 3, 1, 'cream', { inStrip: true }),
  g('Bottle Displays', 'A curated table display', 2, 1, 'plain'),
  g('Store Details', 'Hand-lettered category sign', 1, 1, 'cream'),
  g('Atmosphere', 'Light through a glass of rosé', 2, 2, 'rose', { inStrip: true }),
  g('Bottle Displays', 'Sparkling bottles on ice', 2, 1, 'gold'),
].map((x, i) => ({ ...x, alt: x.title, sortOrder: i }) as Partial<GalleryItem>);
