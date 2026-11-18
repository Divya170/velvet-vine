# Velvet Vine — data model & design extraction

Source: `design-source/*.dc.html` (Claude Design canvas: Main, Wines, About, Selections, Gallery, Contact).
This file is the single reference for copy, rules and flags. The app must not invent anything the design marks as "to be supplied".

## Identity

- **Business:** Velvet Vine, a wine boutique in Ventura, California. Owner: Megan Morgan.
- **Address:** 6381 Cherry Lane, Ventura, CA 93001, USA.
- **Phone:** +1 (735) 918-5261. It was supplied by the client, but 735 is not a Ventura area code, so it is flagged "please confirm" until `phoneVerified` is on.
- **Email:** velvetvine@gmail.com.
- **Hours:** not supplied. The site shows "Store hours to be confirmed. Please call or email before visiting." until hours are entered **and** `hoursVerified` is on.
- **Social links:** none supplied. Links are shown only once added in the admin, as https links to official profiles.
- **Fonts:** Playfair Display (display/serif) and Manrope (UI/body).
- **Colours:**

  | Role | Hex |
  | --- | --- |
  | Ivory background | `#F5F0E7` |
  | Paper | `#FCFAF5` |
  | Ink | `#211D1B` |
  | Wine | `#541C2B` |
  | Deep wine | `#32131D` |
  | Gold | `#B49A68` |
  | Light gold | `#D9C08F` |
  | Gold text | `#7A6034` |
  | Muted | `#6E675F` |
  | Error | `#A3332E` |

- **Motion:**
  - Slow reveal-on-scroll.
  - The hero cross-fades and Ken Burns zooms, every 6–8 s (default 7). It pauses on hover/focus and has a pause button.
  - Image zoom on hover.
  - The Gallery's featured strip is the page's **only** auto-moving element (default 6 s per step).
  - Everything static under `prefers-reduced-motion`.

## Hard rules from the brief (enforced in code)

- **No online alcohol sales.** No price, stock, cart, checkout, shipping, delivery or payment fields exist anywhere. Copy says "available in store only".
- **Age gate:**
  - `settings.ageGateEnabled` is **false by default**. It is switched on only after Velvet Vine confirms the legal requirement.
  - It asks yes/no only and collects no date of birth or personal data. The answer is kept in `sessionStorage` (`vv_age_ok`) for the visit.
  - The minimum age is configurable (default 21).
- **No invented content:** no wine names, prices, regions, grapes, tasting notes, awards, certifications, testimonials, history, hours, partnerships or statistics.
- **Samples:** the 8 seeded wines are `isSample` and carry a visible "Sample" tag. Region and grape show "To be supplied" when empty.
- **Inquiry actions:** every wine has an inquiry action. Card "Ask About This Wine" opens a dialog; the "Availability" link and Our Collection rows go to `/contact?wine=<id>`.
- **No fake success:** a success card shows only after the API returns 201. A failure shows an error with a mailto fallback ("Open This Message in Your Email").

## Routes

| Route | Design file | Sections |
| --- | --- | --- |
| `/` | Main | hero slideshow · intro · categories ("Begin with a style") · featured (1 lead + 3) · experience (4 highlights) · gallery mosaic (6) · visit |
| `/wines` | Wines | hero · sticky style filter chips (+ search) · grid of wine cards · empty state · "Ask the boutique directly" band · inquiry dialog |
| `/about` | About | hero · story (3 paragraphs + pull quote) · four principles I–IV · store experience (3 points) |
| `/collection` | Selections ("Our Collection") | hero · selection index · one editorial section per published selection (4 alternating layouts) · Wine Details spotlight · "Something Caught Your Eye?" CTA |
| `/gallery` | Gallery | hero · featured strip · filter chips by category · masonry grid · lightbox · visit CTA |
| `/contact` | Contact | hero · contact cards (address, phone, email, hours) · inquiry form · location map |
| `/admin/*` | — | login, dashboard, inquiries, wines, wine styles, gallery, page content, settings |

## Entities (SQLite via TypeORM, `database/app.sqlite`)

### `products` (wines)

- `id`, `categoryId` → `product_categories`, `name`, `description`
- `region?`, `grapeVariety?`, `details?` (extra notes, only ever supplied text)
- `imageUrl?`, `imageAlt`, `tint?`, `featured`, `curated` (listed in Our Collection), `isSample`, `sortOrder`, `published`

### `product_categories` (wine styles)

- `name` ("Red Wines"), `slug` ("red"), `shortName` ("Red"), `blurb`, `imageUrl?`, `imageAlt`, `tint`
- `selectionTitle`, `selectionBody`, `selectionPublished`, `sortOrder`, `published`
- Only styles with at least one published wine appear as filters and tiles.
- A selection appears only when it lists at least one curated published wine.
- Tints: `plain | dark | cream | rose | gold | char` (the placeholder panel colours).

### `inquiries`

- `reference` (VV-yymmdd-XXXX), `source` (`contact` | `product`)
- `subject`: `general | availability | collection | visit | other`. Labels: General Inquiry / Product Availability / Collection Information / Store Visit / Other.
- `name`, `email`, `phone?`, `productId?`, `productName?` (snapshot), `message`
- `status` (`new | responded | archived`), `adminNotes?`, `fingerprint`

### `settings` (singleton, id 1)

- Identity and address; `phone`, `phoneVerified`, `email`, `mapEmbedUrl?`
- `heroAutoplay`, `heroIntervalSeconds` (6–8), `galleryStripSeconds` (5–8)
- `ageGateEnabled` (false), `minimumAge` (21)
- `hours[7]`, `hoursVerified`, `socialLinks[]`, `footerNote`

### `content_blocks` (polymorphic `type`)

- `page_copy` (keyed)
- `hero_slide` (3)
- `experience_item` (4, `fields.icon`)
- `philosophy_item` (4, `fields.icon` and `fields.numeral`)
- `store_point` (3)

### `gallery_items`

- `title`, `category`: Boutique Interior / Wine Shelves / Bottle Displays / Product Photography / Store Details / Atmosphere
- `imageUrl?`, `alt`, `rows`, `cols`, `tint`, `inStrip`, `featuredOnHome`, `sortOrder`, `published`

### `admin_users`

- A JWT admin. One is seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Form validation (mirrors the design's `form.js` exactly)

Both forms:

| Field | Rule | Message |
| --- | --- | --- |
| Full Name | ≥ 2 characters | "Please enter your full name." |
| Email | required | "Please enter your email address." |
| Email | matches `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | "Enter an email address like name@example.com." |
| Phone | optional; if given, 10–15 digits | "Enter a phone number with 10 to 15 digits, or leave it blank." |
| Message | 10–1500 characters | "Please write a short message (at least 10 characters)." / "Please keep your message under 1,500 characters." |

**Contact page:**

- Inquiry Type is required: "Choose the type of inquiry."
- Product of Interest (a wine) is optional.

**Wine dialog:**

- A wine is required: "Choose the wine you’re asking about." The option "Not sure yet / general question" is allowed.
- The inquiry is filed as `availability` for a specific wine, or `collection` for a general question.

**Spam protection:**

- Hidden honeypot field `website`.
- Per-IP rate limit (`INQUIRY_RATE_LIMIT` per 10 min).
- Identical messages within 10 minutes are rejected with 409.

## Design-only behaviour NOT reproduced

- The `formState` tweak (forced success/error) and the "Not connected" unsent state are replaced by the real API response.
- The `ageGate` tweak that previews the "not of age" screen is replaced by the settings flag.
- Map preview art is replaced by an embed URL when one is set; otherwise a styled panel with "Open in Google Maps".
