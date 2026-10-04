---
name: Aura Antiqua
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#524343'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#847372'
  outline-variant: '#d6c2c1'
  surface-tint: '#85504f'
  primary: '#42191a'
  on-primary: '#ffffff'
  primary-container: '#5c2e2e'
  on-primary-container: '#d59594'
  inverse-primary: '#fab5b4'
  secondary: '#526256'
  on-secondary: '#ffffff'
  secondary-container: '#d3e4d5'
  on-secondary-container: '#57665a'
  tertiary: '#002c1c'
  on-tertiary: '#ffffff'
  tertiary-container: '#154330'
  on-tertiary-container: '#81b097'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#fab5b4'
  on-primary-fixed: '#350f10'
  on-primary-fixed-variant: '#693939'
  secondary-fixed: '#d6e7d7'
  secondary-fixed-dim: '#bacbbc'
  on-secondary-fixed: '#101f15'
  on-secondary-fixed-variant: '#3b4a3f'
  tertiary-fixed: '#bdedd2'
  tertiary-fixed-dim: '#a1d1b7'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#224f3b'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  headline-xl:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.04em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is centered on the concept of "The Modern Bibliophile." It balances the tactile, historical warmth of a private library with the streamlined efficiency of a contemporary digital tool. The target audience includes avid readers, collectors, and community lenders who value focus, intellectual depth, and calm.

The visual style is a blend of **Minimalism** and **Modern Corporate**, utilizing generous whitespace to mimic the margins of a well-printed book. It avoids aggressive digital trends in favor of a "living room" digital atmosphere—inviting, quiet, and sophisticated. The interface should feel like a high-end reading experience: effortless, respectful of content, and physically grounded.

## Colors

The palette is rooted in the materials of bookmaking. The primary background color is a "Deep Paper White" (#F9F7F2), providing a warm, low-strain surface that feels like archival paper rather than a cold screen.

The primary accent is **Oxford Burgundy** (#5C2E2E), used for primary actions and brand moments to evoke leather bindings. The secondary accent is **Library Green** (#2F3E33), used for success states and "Available" indicators. Text is set in a **Soft Charcoal** (#2D2D2D) to maintain high legibility while reducing the harshness of pure black. Supporting neutrals use subtle parchment and stone tones to define secondary surfaces.

## Typography

This design system employs a classic pairing: **Source Serif 4** for editorial weight and **Inter** for functional clarity.

Source Serif 4 is used for all headlines and book titles, providing an authoritative, literary rhythm. Inter is used for all UI labels, metadata (author names, ISBNs), and body copy to ensure maximum readability at small sizes and high density. Body text uses a slightly wider line-height (1.6) to mimic the comfortable tracking found in hardcover publications. Navigation and metadata utilize uppercase labels with subtle letter-spacing to create a clear hierarchy against the organic serif headers.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to preserve the "book block" aesthetic, centering content within a 1200px container. On mobile, it transitions to a fluid model with 16px margins.

Spacing is governed by an 8px linear scale. We favor large internal padding (24px+) for cards and containers to give the content "room to breathe," reflecting the generous margins of luxury editions. Vertical rhythm is strictly enforced to ensure that rows of book covers and text lines align across the horizontal axis, creating a sense of order and calm.

## Elevation & Depth

The design system utilizes **Tonal Layers** rather than heavy shadows to create depth. Surfaces are distinguished primarily by subtle shifts in background color (e.g., a slightly darker parchment for the sidebar vs. the main paper white).

Where elevation is required for interactivity, we use **Ambient Shadows**: extremely soft, low-opacity (#000 at 4-6%) blurs that suggest a physical object resting on paper. For "Lent" or "Borrowed" states, use a semi-transparent overlay (Backdrop Blur) to visually "recede" the book cover into the background, signaling its current unavailability.

## Shapes

The shape language is **Soft**. We use a 4px (0.25rem) base radius to mirror the subtle rounding of a book's spine or a high-quality paper edge. Hard 90-degree corners are avoided to keep the UI approachable, but large "pill" shapes are also avoided to maintain a professional, architectural structure. Buttons and input fields share this consistent soft radius.

## Components

- **Book Cards:** The central component. Use a vertical 2:3 aspect ratio for covers. Shadows are applied only on hover to simulate "picking up" the book. Metadata is tucked neatly below the cover using `label-md`.
- **Status Indicators (Chips):** Use low-saturation backgrounds with high-contrast text.
  - _Available:_ Library Green (#2F3E33) background at 10% opacity with solid green text.
  - _Lent/Borrowed:_ Soft Charcoal (#2D2D2D) background at 10% opacity with solid charcoal text.
- **Buttons:** Primary buttons use Oxford Burgundy (#5C2E2E) with white text. Secondary buttons use a simple border (ghost style) to remain unobtrusive.
- **Rating System:** Use a five-star icon set. Filled stars use a muted gold; empty stars use a thin Charcoal outline.
- **Input Fields:** Use a "minimalist desk" style—bottom-border only or very light four-sided borders, focusing on the typography of the input rather than the box container.
- **Lists:** Lending history should be presented in a clean, tabular format with ample row height (64px+) and fine 1px dividers in a light parchment shade.
