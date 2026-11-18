# Velvet Vine: website

A working version of the Velvet Vine design, a wine boutique at 6381 Cherry Lane, Ventura, California. It has:

- six public pages: Home, Wine Collection, About, Our Collection, Gallery and Contact
- a filterable, searchable wine collection, with an inquiry action on every wine
- curated editorial selections, plus a "Wine Details" spotlight
- a contact form that saves real inquiries to a database
- a gallery with a slowly moving featured strip and a lightbox
- a configurable legal-age confirmation, **off by default**
- an admin panel for all content

**There is no online alcohol sale of any kind.** No prices, stock levels, cart, checkout, shipping, delivery or payment exist in the database, API or UI. Wines are shown for discovery, and visitors inquire or visit in store.

| Part | Stack | Folder |
|---|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript | `frontend/` |
| API | NestJS 10, TypeORM, class-validator, JWT | `backend/` |
| Database | SQLite 3 | `database/app.sqlite` |

- `design-source/` holds the original six `.dc.html` design artboards.
- `DATA-MODEL.md` lists everything taken from them: routes, seed copy, validation rules and flags, plus the preview-only behaviour that was replaced with real logic.

---

## Quick start

Requires Node.js 18.18+ (20 LTS recommended).

```bash
npm run install:all        # root, backend and frontend dependencies
npm run dev                # API on :4000, website on :3000
```

`backend/.env` and `frontend/.env.local` already hold development values (see the `.env.example` files).

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- API: http://localhost:4000/api

On first start the API creates the tables, seeds the content from the design, and **prints the default admin login**:

```
Email:    admin@velvetvine.local
Password: VelvetVine!2026
```

- To use different credentials, set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first start.
- To change the password later, go to **Admin → Settings**.
- To start over with a fresh database, run `npm run db:reset` and restart the API.

---

## Before launch: open items for Megan Morgan

The site never invents facts. Each item below is a clearly marked placeholder until Velvet Vine supplies or confirms it. The launch checklist on **Admin → Dashboard** tracks each one.

1. **Age confirmation (legal).**
   - The yes/no "Are you 21 or older?" screen is built but **switched off**. Turn it on in **Settings → Legal-age confirmation** only after Velvet Vine confirms it is required.
   - It never asks for a date of birth or stores personal data. The answer lives in the visitor's browser for that visit only.
   - The minimum age is configurable (default 21).
2. **Phone number.**
   - The supplied number, +1 (735) 918-5261, is used exactly as given. However, 735 is not a Ventura, CA area code.
   - Confirm the number, then tick *Phone number verified* in Settings.
3. **Wines.** All 8 wines are labelled **Sample** placeholders.
   - Replace them in **Admin → Wines** with the real list.
   - Add region, grape variety and notes only where known. Blank fields show as "To be supplied" and are never guessed.
   - Untick *Sample* on each real wine.
4. **Styles and selections.**
   - Red, White, Rosé and Sparkling are the brief's illustrative styles.
   - A style appears only while it has published wines.
   - Its Our Collection selection appears only while it lists at least one wine marked *List in Our Collection*.
5. **Store hours.**
   - None were supplied, so every day shows "[Hours to confirm]" and the site says "Store hours to be confirmed. Please call or email before visiting."
   - Enter the hours and tick *confirmed* in Settings. The site then shows them along with an open/closed status.
6. **Photos.** Every image is a labelled, textured placeholder. Upload genuine photographs only. This covers:
   - the hero slides and page heroes
   - the styles and wines
   - the gallery: 14 items, including two "Boutique Interior" panels marked *awaiting genuine photo*
   - the secondary section photos
7. **Brand story.**
   - The third About paragraph is an editable placeholder for Megan's own words.
   - The pull quote "Every bottle has a character worth discovering." is marked *to be approved*.
   - No founding date, history, awards, certifications, partnerships, testimonials or statistics appear anywhere.
8. **Social links and map embed** (optional).
   - Add only official, verified accounts.
   - A Google Maps embed URL replaces the illustrated map preview. Directions links work without it.

---

## Structure

```
velvet-vine/
├── backend/            NestJS API
│   └── src/
│       ├── admin-auth/     JWT login, seeded default admin, password change
│       ├── common/         JWT guard, validation error shape, uploads, slugs
│       ├── content/        one polymorphic ContentBlock: page copy (with up to 3 photo slots), hero
│       │                   photos, home experience highlights, About principles and store points
│       ├── products/       wine styles (+ Our Collection selection copy) and wines: filtered collection,
│       │                   photos, featured / curated / sample flags. No price fields, by design.
│       ├── inquiries/      contact + wine inquiries: validation (inquiry-rules.ts), duplicate check,
│       │                   rate limit, status, CSV export
│       ├── gallery/        photos with category, tile size, tint, strip and homepage flags
│       ├── settings/       singleton: contact details, hours (+ confirmed flag), social links,
│       │                   motion timings, age-gate flag and minimum age
│       └── seed/           idempotent seed with the copy from the design
├── frontend/           Next.js app
│   ├── app/(site)/         /, /wines, /about, /collection (Our Collection), /gallery, /contact
│   ├── app/admin/          login + protected dashboard, inquiries, wines, styles & selections,
│   │                       gallery, page content, settings
│   ├── components/site/    Header, AgeGate, Footer, HeroSlideshow, WineBrowser, WineDialog,
│   │                       WineSpotlight, InquiryForm, SuccessCard, GalleryStrip, GalleryBrowser, …
│   └── components/admin/   AdminShell, EntityManager (generic CRUD with multi-photo slots), UI helpers
├── database/app.sqlite
├── design-source/      original .dc.html artboards
└── DATA-MODEL.md
```

---

## What's dynamic

### Copy

- All copy comes from the database and is editable in **Admin → Page content**: headings, paragraphs, eyebrows, button labels, pull quote and "Client to supply" notes.
- Wrap words in `*asterisks*` to show them in the italic burgundy accent.

### Wine Collection (`/wines`)

- Sticky style chips show counts. Only styles with published wines are listed.
- A search box matches name, region, grape and description.
- Both the style and the search are kept in the URL (`?category=red&q=…`). That lets the homepage tiles, the footer links and Our Collection land on the right filter.
- Each card offers:
  - "Ask About This Wine", which opens a dialog with the wine preselected. The dialog traps focus, closes on Esc and returns focus to the button that opened it.
  - "Availability", which goes to `/contact?wine=<id>&type=availability`.
- Empty states cover: no wines in a style, no search matches, and no wines at all.

### Our Collection (`/collection`)

- One editorial section per published style selection.
- The design's four layouts cycle for any number of selections.
- Each section lists its curated wines, numbered and linked to an inquiry.
- Secondary photos come from those wines' own bottle photos (or labelled placeholders).
- **Wine Details** lets visitors pick any curated wine, by click or arrow keys, to see:
  - type, region and grape ("To be supplied" when empty)
  - description and notes
  - "Ask About This Wine"

### Homepage

- Hero slideshow (6–8 s).
- Style tiles.
- One prominent featured wine plus three more.
- Experience highlights.
- A six-photo gallery mosaic.
- Visit details.

### Forms

Both forms post to `POST /api/inquiries`.

- The rules live in `backend/src/inquiries/inquiry-rules.ts` and are mirrored in `frontend/lib/validation.ts`. Both match the design's `form.js` messages exactly; a parity test returns identical errors for 13 cases.
- **Contact page:**
  - Full Name and Email are required.
  - Phone is optional (10–15 digits).
  - Inquiry Type is required: General Inquiry, Product Availability, Collection Information, Store Visit or Other.
  - Wine of interest is optional.
  - Message must be 10–1,500 characters.
- **Wine dialog:** the wine is required (or "Not sure yet / general question").
- **Protections:**
  - a honeypot field
  - a per-IP rate limit (`INQUIRY_RATE_LIMIT`, default 5 per 10 minutes)
  - an identical-message check that returns `409` with a clear notice
  - selected wines must be published
- **Errors** appear inline, with an error summary that links to each field. If sending fails:
  - the typed details are kept
  - email and phone are offered instead
  - "Open This Message in Your Email" pre-fills the visitor's own email app
- **On success**, a success card appears (only after HTTP 201) with a next action:
  - from Contact: **Explore the Wine Collection**
  - from the dialog: **Browse Our Collection**
  - plus "Send another" in both cases

### Admin

- **Inquiries:**
  - search; filter by status, type and which form sent it
  - sort and paginate
  - CSV export, guarded against spreadsheet formula injection
  - internal notes, a pre-filled reply email and tap-to-call
  - delete with confirmation
- **Dashboard:** new, last-7-days and responded counts, inquiries by type, the most-asked-about wines, and the launch checklist.

### Gallery

- The **featured strip** is the page's only auto-moving element:
  - it steps every 5–8 s (set in Settings)
  - it pauses on hover or focus, on its pause button, and when the tab is hidden
  - it stays still for `prefers-reduced-motion`
  - it is hidden until at least three photos are picked
- Category chips cover only categories that have photos.
- The masonry grid opens a lightbox with a counter, arrow keys, Esc, swipe and a focus trap.

### Age confirmation

- Rendered only when enabled.
- Full-screen and focus-trapped; the rest of the page is made `inert`.
- Includes "I chose the wrong answer".

### Loading, empty and error states

Every page has a skeleton loader, empty-state copy, and a retry screen for when the API can't be reached.

## Content rules the build enforces (from the brief)

- No online alcohol sales. That means no price, cart, checkout, shipping, delivery or payment.
- No invented content. That covers wine names, prices, regions, grapes, tasting notes, awards, certifications, testimonials, history, store hours, partnerships, statistics and social accounts.
- No fake form success.
- No imagery presented as the real boutique or its stock. Missing photos show as labelled placeholders.
- Accessibility:
  - skip link and visible focus
  - 44 px targets
  - labelled fields with `aria-invalid`/`aria-describedby`
  - error summary
  - focus moves to the success heading
  - focus-trapped dialogs, lightbox and age gate
  - WCAG AA colour pairs: burgundy `#541C2B` on cream; text-safe gold `#7A6034`

## API overview

Public:

```
GET  /api/settings                   boutique details, links, hours display, open status (confirmed only), age-gate flag
GET  /api/content?type=…             published blocks of one type
GET  /api/content/page-copy          all page copy keyed by key
GET  /api/products                   { categories (with wines), allCategories, items, total }
GET  /api/products/featured?limit=4
GET  /api/products/selections        Our Collection: published selections with their curated wines
GET  /api/products/:id
GET  /api/gallery | /gallery/home | /gallery/strip
POST /api/inquiries                  → 201 receipt | 400 {message, errors} | 409 duplicate | 429
```

Admin (Bearer JWT from `POST /api/admin-auth/login`):

```
GET/PATCH                       /api/admin/settings
GET/POST/PATCH/DELETE           /api/admin/content[/:id]              (+ POST|DELETE /:id/image?slot=imageUrl|image2Url|image3Url)
GET/POST/PATCH/DELETE           /api/admin/product-categories[/:id]   (+ POST|DELETE /:id/image)
GET/POST/PATCH/DELETE           /api/admin/products[/:id]             (+ GET /counts, POST|DELETE /:id/image)
GET/POST/PATCH/DELETE           /api/admin/gallery[/:id]              (+ POST|DELETE /:id/image)
GET                             /api/admin/inquiries?search&status&subject&source&sort&page&pageSize
GET                             /api/admin/inquiries/stats | /export.csv
GET/PATCH/DELETE                /api/admin/inquiries/:id
```

## Production notes

- **Secrets and origins:**
  - Set a long random `JWT_SECRET`.
  - Set `CORS_ORIGINS` to the site's domain.
  - Point `NEXT_PUBLIC_API_URL` at the public API.
- **Reverse proxy.** If the API runs behind one, set `TRUST_PROXY=1` so the rate limit sees real visitor IPs.
- **Timezone.** `SHOP_TIMEZONE` (default `America/Los_Angeles`) is used for the open/closed status once hours are confirmed.
- **Schema.** `synchronize: true` builds the schema from the entities. Switch to migrations if the schema will keep changing on a live database.
- **Backups.** Back up `database/app.sqlite` and `backend/uploads/` together.
- **Email.** No notification email is sent for new inquiries, because no mail service was specified. Inquiries appear in the admin straight away.
