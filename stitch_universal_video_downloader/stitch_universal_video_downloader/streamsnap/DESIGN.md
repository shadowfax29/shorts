---
name: StreamSnap
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464554'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#b90538'
  on-tertiary: '#ffffff'
  tertiary-container: '#dc2c4f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for efficiency and high-performance utility. It targets a tech-savvy audience that values speed and reliability over decorative flourishes. The brand personality is "The Precise Tool"—it is authoritative, focused, and ultra-modern.

The visual direction follows a **Modern Minimalist** aesthetic with a **Glassmorphic** layer for contextual overlays. It utilizes heavy whitespace to reduce cognitive load during the high-intent action of media processing. The interface feels "tech-forward" through the use of high-contrast action colors against a clinical, clean slate backdrop, creating a clear hierarchy between the tool and the content it manages.

## Colors

The palette is anchored by **Electric Indigo**, a high-energy hue used exclusively for primary actions and interactive states. This is contrasted against a **Clean Slate** background to maintain a sense of airiness and professional clarity.

- **Primary (Electric Indigo):** Used for CTA buttons, active progress states, and focus indicators.
- **Success (Emerald):** Used for completed download states and "ready" indicators.
- **Error (Rose):** Reserved for failed URL fetches or connectivity issues.
- **Neutrals:** The background is #f8fafc (Slate 50), while primary containers and cards use pure #ffffff to create a subtle elevation through color contrast alone.

## Typography

This design system utilizes **Inter** across all levels to maintain a systematic, utilitarian feel. The type hierarchy relies on heavy weight distribution (Bold/Semibold) for headings to provide instant orientation in a utility-based workflow.

- **Headlines:** Use tight letter-spacing (-0.02em) to maintain a compact, "pro" look.
- **Body:** Standard tracking for maximum readability during data-heavy tasks.
- **Labels:** Uppercase or high-weight tracking is used for platform badges and metadata to distinguish them from actionable text.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for the central utility dashboard, ensuring the focus remains on the URL input and download queue. 

- **Desktop:** 12-column grid with a maximum container width of 1200px. Content is centered to prevent visual scanning fatigue.
- **Spacing Rhythm:** Based on an 8px linear scale. Generous internal padding (32px+) is used within white containers to reinforce the minimalist aesthetic.
- **Mobile:** Transitions to a single-column fluid layout with 16px side margins. Elements like quality selection cards stack vertically to maintain touch-target integrity.

## Elevation & Depth

Hierarchy is established through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Level 0 (Background):** Slate 50 (#f8fafc), flat.
- **Level 1 (Cards/Containers):** White (#ffffff) with a very soft, diffused shadow (0px 10px 15px -3px rgba(0, 0, 0, 0.05)).
- **Overlays (Modals/Dropdowns):** Subtle glassmorphism. Use a backdrop blur of 12px with a 70% opaque white fill. This allows the user to maintain context of the download queue behind the overlay.
- **Interactive:** On hover, buttons and cards should slightly increase shadow depth and shift -2px on the Y-axis to provide tactile feedback.

## Shapes

The design system employs a consistent **16px (1rem)** corner radius for all primary UI components, including the main URL input and quality selection cards. This "Rounded" profile softens the technical nature of the app, making it feel more approachable and modern.

- **Small Components:** Checkboxes and small badges use a reduced 6px radius.
- **Input Fields:** Maintain the 16px radius to match the primary container aesthetics.

## Components

### URL Input
The "Hero" component of the system. It should be oversized (height: 64px) with a subtle 2px inset border when focused (Electric Indigo). The "Paste" or "Download" button is nested within the right side of the input field for a compact, unified feel.

### Platform Badges
Small, pill-shaped tags with a light tinted background of the platform's brand color (e.g., light red for YouTube, light pink for Instagram) and high-contrast text. Used for quick visual filtering.

### Quality Selection Cards
Large-format selectable cards. Each card displays the resolution (e.g., 1080p), file size, and format. Use a 2px Electric Indigo border to indicate the selected state.

### Progress Bars
Thin (8px height) tracks using Slate 200 for the background and a solid Electric Indigo fill. For "Success" states, the bar transitions to Emerald.

### Notifications
Toast-style notifications appearing at the top-right. Utilize the glassmorphism style defined in the Elevation section with a thick 4px left-border colored by status (Indigo, Emerald, or Rose).