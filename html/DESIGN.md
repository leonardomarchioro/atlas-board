---
name: Atlas
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#b7c8e1'
  on-secondary: '#213145'
  secondary-container: '#3a4a5f'
  on-secondary-container: '#a9bad3'
  tertiary: '#ffb596'
  on-tertiary: '#581e00'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system is built for a premium SaaS environment, emphasizing clarity, professional rigor, and high-velocity collaboration. The aesthetic is rooted in **Modern Minimalism** with a "Dark Mode First" philosophy. It balances a high-density information architecture with generous whitespace to reduce cognitive load. 

The emotional response should be one of "command and control"—providing the user with a sense of calm efficiency through systematic precision. Key visual markers include crisp borders, subtle elevation through tonal layering rather than heavy shadows, and a focus on high-legibility typography.

## Colors

The palette is anchored by a high-performance Royal Blue (`#2563EB`), used strategically for primary actions and focus indicators to maintain a professional "Enterprise" feel. 

- **Primary:** Royal Blue is used for intent. It should be used sparingly for maximum impact.
- **Surface Strategy (Dark):** The background uses a deep Zinc-950 (`#09090B`). Component surfaces use Zinc-900 (`#18181B`) to create depth without relying on drop shadows.
- **Surface Strategy (Light):** A clean Slate-50 (`#F8FAFC`) background with pure white (`#FFFFFF`) surfaces creates a crisp, laboratory-clean environment.
- **Feedback:** Use standard semantic colors (Success: Emerald, Warning: Amber, Destructive: Rose) but desaturated by 10% to fit the premium aesthetic.

## Typography

This design system utilizes **Inter** for its neutral, highly legible characteristics in functional UI. For technical data and labels, **Geist** is introduced to provide a subtle "developer-tool" precision.

- **Scale:** High contrast between headlines and body text to facilitate quick scanning of task headers.
- **Weight:** Use Semibold (600) for primary headers and Medium (500) for interactive labels.
- **Spacing:** Tighten letter-spacing on larger headlines (`-0.02em`) to maintain the "premium" feel of high-end editorial SaaS.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for content areas, while sidebar navigation remains fixed at 240px or 64px (collapsed).

- **Grid:** 24px gutters provide breathing room for complex task boards.
- **Rhythm:** An 8pt linear scale is used for all spatial relationships. 4px (1u) is reserved for micro-adjustments within components like icons and text.
- **Mobile:** Reflow content into a single column. Horizontal scrolling is permitted only for data tables and kanban boards to preserve the desktop-like productivity mental model.

## Elevation & Depth

Depth is primarily communicated through **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** In dark mode, the primary surface is `#18181B`. Nested elements (like input fields) should be slightly darker or use a subtle 1px border.
- **Borders:** Use 1px borders for all cards and containers.
  - Dark Mode: `rgba(255, 255, 255, 0.1)`
  - Light Mode: `rgba(0, 0, 0, 0.08)`
- **Shadows:** Use a single, highly-diffused ambient shadow for overlays/modals only.
  - `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`

## Shapes

The design system follows a consistent **Rounded** geometry (`0.5rem` / `8px`) to soften the professional aesthetic and make the UI feel approachable yet structured.

- **Base Radius:** 8px for buttons, inputs, and small cards.
- **Large Radius:** 12px for main containers and modals (`rounded-lg`).
- **Extra Large:** 24px for specific marketing elements or user avatars (`rounded-xl`).
- **Interactive Elements:** Maintain consistent corner radii across all form factors to ensure a unified component language.

## Components

Components are inspired by the `shadcn/ui` philosophy: functional, accessible, and stylistically restrained.

- **Buttons:** 
  - Primary: Solid Royal Blue with white text. 
  - Secondary: Ghost style with subtle border.
  - Hover: Background color shifts 5-10% darker/lighter. Transitions should be `150ms ease-in-out`.
- **Inputs:** 
  - Minimalist 1px border. 
  - Focus state: 2px Royal Blue ring with 2px offset.
- **Cards:** 
  - No shadows in standard state; 1px border only. 
  - On hover, a very subtle shift in background color or a primary-colored top-border.
- **Chips/Badges:** 
  - Small, caps-heavy Geist font. 
  - Use "soft" versions of semantic colors (e.g., light blue background with dark blue text).
- **Status Indicators:** 
  - Use a small 8px dot with a subtle pulse animation for "Live" or "Active" task states.
- **Loading:** 
  - Use skeleton screens that match the exact geometry of the cards/lists they represent.