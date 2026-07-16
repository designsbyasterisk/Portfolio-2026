## HONÉE — Premium Lipcare Storefront

A warm, editorial e-commerce site built on brand: TAN Grandeur display + DM Sans body, palette of cream `#FFF3E3`, honey `#F6C453`, caramel `#C68A5A`, and deep cocoa from the logo. Aesthetic reference: Aesop, Glossier, Byredo — generous whitespace, slow scroll-reveal motion, oversized serif type, soft honey-tinted imagery.

### Pages (TanStack file routes)
- `/` — Home: full-bleed hero with HONÉE wordmark + tagline "Honey, Please," a slow honey-drip motion accent, featured product rail (4 items), brand story strip, ingredient/ritual section, footer.
- `/shop` — All products grid (4 cards, large imagery, hover reveal of secondary shot).
- `/product/$slug` — PDP: split layout, large gallery left / sticky info right, product story, "Honey, Look Here / Good Night / Drippin' / All Day" copy from the brief, add-to-cart, suggested products.
- `/about` — Brand story, philosophy, ingredient notes.
- `/cart` — Slide-over drawer + dedicated cart page.

Each route gets its own SEO `head()` (title, description, og).

### Design system
- Install TAN Grandeur via `@font-face` from `public/fonts/` (uploaded woff/woff2) and DM Sans from Google Fonts.
- `src/styles.css` tokens (oklch): `--background` cream, `--foreground` cocoa, `--primary` honey, `--accent` caramel, plus `--gradient-honey` and `--shadow-warm`.
- Components: custom Button (cocoa pill + honey hover), ProductCard, Hero, Marquee, SectionHeading, CartDrawer.
- Motion: Framer Motion for hero reveal, image parallax on PDP, marquee of taglines, soft fade-in on scroll.

### Assets
- Copy logo to `src/assets/honee-logo.png`.
- Copy product photos from the parsed PDF into `src/assets/products/` (lip gloss, scrub, oil, balm — multiple shots each).
- Replace with the higher-quality product images you'll send as they arrive.

### Commerce backend
For a real shop with cart + checkout, I recommend enabling **Shopify** (best fit for physical products — inventory, variants, checkout handled). Alternatively I can build a **visual-only storefront** now (cart state in memory, no real checkout) and wire commerce later.

### Tech notes
- TanStack Start file routes under `src/routes/`, shared layout via `__root.tsx` (nav + footer).
- Cart state via Zustand (lightweight, persisted to localStorage) until commerce backend is chosen.
- Each route file sets unique `head()` meta.

### Open questions
1. **Commerce backend now or later?** Shopify (recommended) vs. visual-only mock for v1.
2. **Scope of v1** — all 5 pages above, or start with Home + Shop + PDP and add About/Cart later?
3. Anything you want me to skip until product photos arrive (I'll use the PDF stills as placeholders).
