---
target: full-app
total_score: 22
p0_count: 0
p1_count: 2
p2_count: 2
p3_count: 1
timestamp: 2026-09-12T17-04-36Z
slug: dchiripa-store
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good skeletons/toasts, but silent fetch failures (tags, subscription checks) and no progress indicators on checkout redirect |
| 2 | Match Between System and Real World | 3 | Spanish-first is consistent, but "accessType: subscription" leaks through to UI copy. "Qué incluye" section hardcodes formats (PSD, AI, Figma) regardless of actual product files |
| 3 | User Control and Freedom | 3 | Breadcrumbs on product detail, back buttons present. But auto-playing image carousel has no visible pause control (hover-only), and admin has no breadcrumb or back path |
| 4 | Consistency and Standards | 2 | Card-based layout everywhere (stat cards, pricing cards, product cards, benefit cards, quick-link cards). Same shadcn defaults with minimal customization. Admin dashboard stat cards look identical to dashboard stat cards — no visual differentiation between user-facing and admin contexts |
| 5 | Error Prevention | 2 | Registration has inline validation, but password strength indicator only shows "8+ caracteres" — no uppercase/special character guidance. Delete account requires password but the confirmation checkbox is a bare HTML input, not styled consistently. No guard against accidental subscription cancellation |
| 6 | Recognition Rather Than Recall | 3 | Search keyboard shortcut (/) is visible in header. Active nav states present. But tag filter is a dropdown — a horizontal tag bar with selected state would reduce recall |
| 7 | Flexibility and Efficiency of Use | 1 | No keyboard shortcuts for primary actions (purchase, navigate). No bulk actions in admin. No command palette. Notification preferences stored only in localStorage — not synced across devices. Sort options require opening a dropdown every time |
| 8 | Aesthetic and Minimalist Design | 2 | Clean but generic. Every section uses the same card pattern. Testimonials are hardcoded fakes with identical 5-star ratings. The features section on the homepage (4 icons + text) is functional but visually indistinct. No visual hierarchy between homepage sections — they all have equal weight |
| 9 | Error Recovery | 2 | Toast notifications for errors, but some API failures are caught silently (tags fetch, subscription check). The product detail page catches image errors with a fallback, but no retry mechanism. Cart/checkout errors show "Error de conexion" with no guidance |
| 10 | Help and Documentation | 1 | Zero contextual help anywhere. No tooltips on pricing feature differences. No FAQ on the product detail page. The "2FA próximamente" placeholder in settings is a dead end with no timeline or alternative |
| **Total** | | **22/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**Does this look AI-generated?**

**LLM assessment:** Partially. The interface is competent and functional, but carries several AI tells:

1. **Side-tab accent border** — `border-l-4` on subscription status card (`src/app/dashboard/suscripcion/page.tsx:157`). This is the single most recognizable AI UI pattern.
2. **Sparkles icon as eyebrow** — Pricing page uses `<Sparkles>` inside the "Más popular" badge, which is the eyebrow trope one tier deeper.
3. **Generic shadcn/ui feel** — Every card, button, badge, and dropdown is stock shadcn with zero visual customization. The component library does the heavy lifting; the design adds nothing on top.
4. **Identical card grids** — Stat cards (dashboard, admin), pricing cards, benefit cards, quick-link cards, and product cards all follow the same icon/heading/text/footer pattern.
5. **Hardcoded testimonial fakes** — Three identical 5-star testimonials with generic quotes and stock names. This is the "social proof" template reflex.
6. **Feature section as icon grid** — Homepage features are 4 icons with title+description in a row. Classic AI landing page scaffolding.
7. **Color palette is functional but safe** — Orange-red primary on white is serviceable but doesn't convey "Creativo, Moderno, Bold" — it's the default shadcn warm accent.

**Deterministic scan:** 1 finding — `side-tab` accent border at `src/app/dashboard/suscripcion/page.tsx:157` (`border-l-4`). This is a P2 anti-pattern per the Impeccable detector.

**Assessment independence:** Degraded (spawn_agent unavailable in this session; sequential execution).

## Overall Impression

The app is functional and well-structured, but it reads as "shadcn/ui template with Spanish copy." The brand personality (Creativo, Moderno, Bold) doesn't come through in the visual design. The interface is clean enough to use, but forgettable — a designer buying design files would not trust the product quality based on this interface alone. The biggest missed opportunity: the homepage should showcase the design files themselves as the hero content, but instead leads with generic copy and a standard two-column layout.

## What's Working

1. **Consistent Spanish localization** — Copy, labels, error messages, and empty states are all in Spanish with natural phrasing. No English leaks. This is well-executed across all surfaces.
2. **Skeleton loading states** — Every data-fetching page has a skeleton that matches the final layout structure. This is better than most shipping products.
3. **Clean information hierarchy** — Headings, body text, and muted text have clear size and weight differentiation. The product detail page reads well from top to bottom.

## Priority Issues

### [P1] Color contrast failures across multiple surfaces
**What:** Primary color (orange-red) on white background yields ~3.5:1 contrast — fails WCAG AA for normal text. Muted foreground on white yields ~4.1:1 — also fails AA. The warning star icons in testimonials fail at ~3.6:1.
**Why it matters:** Designers are the target audience — they will notice and judge accessibility failures immediately. This undermines trust in product quality.
**Fix:** Darken the primary to at least hsl(15, 65%, 40%) for 4.5:1+ on white. Bump muted-foreground to hsl(15, 12%, 38%) or darker.
**Suggested command:** `$impeccable colorize`

### [P1] Generic shadcn/ui — no visual identity
**What:** Every component is stock shadcn with zero customization. Cards, buttons, badges, inputs, dropdowns all look like the default. The product is for designers — they expect visual craft.
**Why it matters:** The brand says "Creativo, Moderno, Bold" but the interface says "default component library." Designers buying design files need to trust that the product quality matches their standards.
**Fix:** Customize the component library: unique button styles, card treatments, typography choices, hover states. Add at least one distinctive visual element (custom iconography, a unique card treatment, an unexpected layout move).
**Suggested command:** `$impeccable bolder`

### [P2] Side-tab accent border on subscription card
**What:** `border-l-4 border-l-success` / `border-l-4 border-l-warning` on the subscription status card. This is the #1 AI UI tell.
**Why it matters:** Anyone familiar with AI-generated interfaces will spot this immediately.
**Fix:** Remove the left border. Use background tint, icon indicator, or badge instead.
**Suggested command:** `$impeccable quieter`

### [P2] Homepage lacks visual impact for a design-file marketplace
**What:** Hero section is a standard two-column layout with copy left, product grid right. Features section is a 4-icon grid. Categories are plain bordered boxes. Testimonials are hardcoded fakes.
**Why it matters:** This is the first impression for designers. If the homepage doesn't demonstrate visual craft, they won't trust the product files.
**Fix:** Make the hero image-forward — show the actual design files as the hero content. Replace the feature icon grid with something more distinctive. Replace hardcoded testimonials with real social proof or remove them.
**Suggested command:** `$impeccable bolder`

### [P3] Silent error handling throughout
**What:** Multiple `catch {}` blocks that swallow errors silently — tags fetch (`products-client.tsx:34`), subscription check (`products-client.tsx:192`), dashboard data (`page.tsx:44`). No retry, no fallback UI, no user feedback.
**Why it matters:** When the API is slow or down, users see empty states with no explanation. The loading skeleton finishes, then they get "No se encontraron productos" when the real issue is a network error.
**Fix:** Add error states that distinguish "no results" from "failed to load." Show a retry option on fetch failures.
**Suggested command:** `$impeccable harden`

## Persona Red Flags

### Casey (Distracted Mobile User)
- Product card purchase button is at the bottom of the card — requires scrolling past image + title + description on mobile
- Search requires navigating to `/productos` first, then focusing the input — two steps where one would suffice
- Mobile menu is a simple vertical list — no icons, no visual hierarchy between navigation and account actions

### Riley (Stress Tester)
- Notification preferences stored in localStorage only — lost on incognito/clear-cache, not synced across devices
- Auto-playing image carousel on product detail has no visible pause control (hover-only, which doesn't work on mobile)
- Delete account flow has a bare HTML checkbox (`<input type="checkbox">`) not using the styled toggle component used elsewhere — inconsistency
- The "2FA próximamente" section is a dead end with a disabled button — no way to know when it'll be available

### Alex (Power User)
- Zero keyboard shortcuts beyond search (/)
- No command palette
- Admin has no bulk actions for products, users, or subscriptions
- Sort requires opening a dropdown every time — no keyboard-navigable sort control
- Settings tabs are not keyboard-navigable in a meaningful way (no shortcut to jump between tabs)

## Minor Observations

1. **Testimonial stars use `fill-warning text-warning`** — the yellow stars on white have ~3.6:1 contrast. Should use a darker gold or add a text label ("5/5").
2. **Product detail "Qué incluye" section hardcodes format types** — shows "PSD, AI, Figma, etc." regardless of what the product actually contains. Should read from product data.
3. **Pricing page Free plan button is `disabled` when `!plan.priceId`** — but the env var fallback is `'price_monthly'`, so it's never actually disabled. The dead code creates confusion.
4. **Admin stat cards have colored progress bars** — but the "Usuarios" bar is always 100% width (it shows total, not a ratio). Misleading visual.
5. **Header search navigates to `/productos` then focuses the input after 200ms** — fragile timing. Should use a proper search modal or URL-based search state.
6. **Mobile menu items have `min-h-[44px]`** — good touch target, but the sign-out button at the bottom has no visual separation from navigation items.
7. **The product detail carousel auto-plays every 3 seconds** — too fast for users trying to examine a design file. Should be 5-8 seconds or manual-only.

## Questions to Consider

- "What would a designer think when they land on this homepage — would they trust that the files inside are high-quality?"
- "If you removed all the shadcn defaults and started from scratch, what would Dchiripa Store's visual identity actually be?"
- "Is the pricing page's 3-tier structure the right model for a marketplace where some items are subscription-only and others are one-time purchase?"
- "What's the single most memorable visual moment on any page — and does it exist?"
