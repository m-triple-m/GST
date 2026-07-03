---
design-tokens:
  colors:
    brand:
      teal:
        50: "#f0fafa"
        100: "#e0f5f5"
        300: "#00c0c0"
        400: "#00a0a0"
        500: "#008080" # Signature 'Earth Teal'
        600: "#006666"
    neutral:
      slate:
        50: "#f8fafc" # App Background
        100: "#f1f5f9"
        200: "#e2e8f0"
        300: "#cbd5e1"
        400: "#94a3b8"
        500: "#64748b"
        600: "#475569"
        700: "#334155"
        800: "#1e293b"
        900: "#0f172a" # Content Dark
        950: "#0a0f1e" # Deep Background
  typography:
    families:
      sans: "'Inter', system-ui, -apple-system, sans-serif"
      serif: "'Playfair Display', Georgia, serif"
    weights:
      light: 300
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
      extrabold: 800
      black: 900
    scales:
      xs: "0.75rem"
      sm: "0.875rem"
      base: "1rem"
      lg: "1.125rem"
      xl: "1.25rem"
      "2xl": "1.5rem"
      "3xl": "1.875rem"
      "4xl": "2.25rem"
      "5xl": "3rem"
  radii:
    sm: "0.125rem"
    md: "0.375rem"
    lg: "0.5rem"
    xl: "0.75rem"
    "2xl": "1rem"
    full: "9999px"
  shadows:
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    card-hover: "0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 128, 128, 0.2)"
    nav-scrolled: "0 1px 40px rgba(0, 0, 0, 0.3)"
  motion:
    duration:
      fast: "200ms"
      standard: "300ms"
      entrance: "700ms"
    easing:
      out: "cubic-bezier(0, 0, 0.2, 1)"
      standard: "cubic-bezier(0.4, 0, 0.2, 1)"
  surfaces:
    glass:
      background: "rgba(255, 255, 255, 0.05)"
      blur: "12px"
      border: "rgba(255, 255, 255, 0.1)"
    seismic-grid:
      size: "48px"
      opacity: "0.04"
---

# GST Design System: Professional Science & Data

The Geophysical Society of Tulsa (GST) design system is built to convey a sense of **technical authority, scientific precision, and geophysical heritage**. It balances the rugged, earth-centric nature of geology with the modern, data-driven world of 21st-century geophysics.

## Design Philosophy

### 1. The "Earth Teal" Signature
At the core of the identity is **Earth Teal (#008080)**. Unlike standard medical or corporate teals, this specific hue is paired with deep slates to represent the intersection of technology and the subsurface. It is used sparingly but decisively for primary actions, progress indicators, and key structural accents.

### 2. Geological Texture & Depth
The interface avoids flat, generic backgrounds. Instead, it utilizes:
- **Seismic Grid Patterns**: Subtle, repeating linear gradients that evoke seismic survey grids and topographic maps.
- **Glassmorphism**: Backdrop blurs and semi-transparent layers (`glass-card`) represent the layers of the earth—allowing content to sit "on top" of a complex foundation without losing legibility.
- **Imagery Overlays**: Hero sections use geological imagery treated with dark teal gradients, ensuring the brand identity is felt even within photography.

### 3. Precision Typography
The system uses **Inter** as its primary typeface. Its high legibility and "neutral-but-precise" character reflect the scientific nature of the society's work.
- **Technical Headings**: Extra-bold and Black weights are used for high-level sections to command attention.
- **Prestige Serifs**: **Playfair Display** is reserved for specific narrative or historical context, adding a sense of legacy and institutional weight where needed.

## Visual Components

### Interactive Surfaces
- **Event Cards**: Utilize `translateY` elevation on hover to signal interactivity. A subtle teal glow (`shadow: card-hover`) reinforces the brand during user engagement.
- **Buttons**: Action buttons use a "living" gradient—shifting opacity between two teal tones on hover to create a tactile, responsive feel.
- **Navigation**: The sticky navbar transitions from transparent to a deep slate blur (`nav-scrolled`) upon scroll, maintaining context while staying unobtrusive.

### Layout Principles
- **Air & Hierarchy**: Generous whitespace (slate-50 background) ensures that dense technical data or event listings remain digestible.
- **Corner Radii**: The use of `2xl` (1rem) radii for large cards creates a modern, approachable feel, while smaller `md` radii for inputs and buttons maintain a crisp, professional edge.

## Motion & Entrance
Motion is used to reinforce the "discovery" aspect of exploration.
- **Fade-In Up**: Core sections enter with a 24px vertical slide, mimicking a revealing of information.
- **Slide-In Left**: Used for sidebar elements to provide directional context.
- **Delays**: Staggered animation delays (100ms-600ms) are used in grids to create a rhythmic, polished entrance for data-heavy sections.
