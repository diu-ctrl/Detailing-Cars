---
name: Apex Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cec7ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#979177'
  outline-variant: '#4b4732'
  surface-tint: '#e1c700'
  primary: '#fffaf7'
  on-primary: '#383000'
  primary-container: '#fcdf00'
  on-primary-container: '#706200'
  inverse-primary: '#6c5e00'
  secondary: '#b0c6ff'
  on-secondary: '#002d6e'
  secondary-container: '#548dff'
  on-secondary-container: '#002761'
  tertiary: '#edffff'
  on-tertiary: '#003739'
  tertiary-container: '#19f6ff'
  on-tertiary-container: '#006d71'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe328'
  primary-fixed-dim: '#e1c700'
  on-primary-fixed: '#211c00'
  on-primary-fixed-variant: '#514700'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b0c6ff'
  on-secondary-fixed: '#001944'
  on-secondary-fixed-variant: '#00429a'
  tertiary-fixed: '#5df7ff'
  tertiary-fixed-dim: '#00dce4'
  on-tertiary-fixed: '#002021'
  on-tertiary-fixed-variant: '#004f52'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-deep: '#000000'
  surface-elevated: '#161616'
  glass-border: rgba(255, 255, 255, 0.1)
  text-primary: '#FFFFFF'
  text-secondary: '#A1A1AA'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 120px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
---

## Brand & Style

The design system is engineered for a premium, high-performance car detailing service. It targets discerning automotive enthusiasts who value meticulous craftsmanship and professional-grade results. The aesthetic is **High-Contrast / Modern**, emphasizing the "before and after" impact of detailing services through a sophisticated, dark-mode-first approach.

The visual language balances the raw power of automotive engineering with the surgical precision of detailing. We utilize deep blacks to represent luxury and depth, punctuated by high-visibility accents that mirror performance calipers or caution tape. The interface should feel technical yet accessible, evoking the atmosphere of a high-end, clean-room garage.

## Colors

The palette is anchored by **Pure Black (#000000)** and **Deep Neutral (#0A0A0A)** to provide a canvas where high-gloss automotive photography can truly shine. 

- **Primary (Vibrant Gold):** Used exclusively for high-priority calls to action, price points, and status indicators. It represents premium quality and "gold standard" service.
- **Secondary (Performance Blue):** Utilized for interactive elements that are secondary to the main conversion path, such as filter chips or informational links.
- **Surface Strategy:** We use a tiered dark system. The background is pure black, while cards and containers use a slightly lighter elevation (#161616) to create depth without relying on traditional shadows.

## Typography

The typography strategy focuses on "Industrial Elegance." 

- **Headlines:** Montserrat provides a geometric, wide stance that feels stable and authoritative. Large display type should use heavy weights (700-800) with tight tracking to mimic automotive branding.
- **Body:** Inter is used for its exceptional legibility at all sizes, ensuring that service descriptions and technical specifications are easy to scan.
- **Labels:** We introduce JetBrains Mono for utility labels, technical specs, and metadata. This monospaced touch reinforces the "precision" aspect of the detailing service.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to maintain a premium, editorial feel, transitioning to a flexible fluid model on mobile devices.

- **Rhythm:** A strict 8px base unit governs all padding and margins. 
- **Sectioning:** Large vertical gaps (120px+) are used between major content blocks to create a "gallery" feel, allowing photography of high-end vehicles to breathe.
- **Grid:** A 12-column grid is standard for desktop. Elements should often "break" the grid or use asymmetric positioning to create visual tension and energy.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layers** and **Glassmorphism**, rather than heavy shadows.

- **Stacking:** The base layer is #000000. Elements resting on it use #161616. 
- **Borders:** Instead of shadows, use 1px solid borders (`glass-border`) to define element boundaries. This creates a "precision-cut" look.
- **Accents:** Active states or featured cards can use a subtle outer glow of the primary color (low spread, 10% opacity) to simulate the reflection of neon or studio lights on a car's paint.

## Shapes

The shape language is **Soft (0.25rem)**. 

While the brand is bold, slightly softened corners (4px) prevent the UI from feeling dated or overly aggressive (Brutalist). This subtle radius suggests the aerodynamic curves of a modern vehicle while maintaining the structural integrity of a professional service. 

- **Buttons:** Use 4px radius for a "machined" look.
- **Feature Cards:** Use 8px (rounded-lg) for larger containers to differentiate them from smaller UI components.

## Components

### Buttons
- **Primary:** Background `#FCDF00`, text `#000000`, bold Montserrat. No border.
- **Secondary:** Transparent background, 1px `#FFFFFF` border, text `#FFFFFF`.
- **Tertiary/Ghost:** Text `#FFFFFF` with the `label-caps` typography style.

### Cards
Cards should feature a 1px border. For service cards, use a "Dark Glass" effect: background `rgba(22, 22, 22, 0.8)` with a 20px backdrop blur. This allows car photography in the background to bleed through slightly.

### Input Fields
Inputs should be dark-themed with a bottom-only border or a very subtle ghost-box. Focus state transitions the border to the Primary Gold.

### Chips & Tags
Use `label-caps` typography inside `#161616` containers with a 1px border. For "Active" or "Special" status, use a small 8px solid circle of the Primary Gold next to the text.

### Additional Components
- **Before/After Slider:** A custom component with a vertical handle in Primary Gold, allowing users to swipe between a dirty and detailed vehicle image.
- **Process Timeline:** A vertical line component using the Secondary Blue to track the multi-step ceramic coating or detailing process.