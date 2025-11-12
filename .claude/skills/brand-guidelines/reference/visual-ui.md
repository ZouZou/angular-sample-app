# Visual & UI Guidelines

## Brand Color Palette

### Primary Colors
- **Primary Blue**: `#0066CC` (`--primary-color`)
  - Use for: Primary CTAs, links, interactive elements
  - Hover state: `#0052A3`

- **Primary Dark**: `#003366` (`--primary-dark`)
  - Use for: Headers, navigation, emphasis

### Secondary Colors
- **Accent Teal**: `#00A896` (`--accent-teal`)
  - Use for: Success states, highlights, badges

- **Accent Orange**: `#FF6B35` (`--accent-orange`)
  - Use for: Warnings, important alerts, call-outs

### Semantic Colors
- **Success**: `#28A745` (`--color-success`)
- **Warning**: `#FFC107` (`--color-warning`)
- **Error**: `#DC3545` (`--color-error`)
- **Info**: `#17A2B8` (`--color-info`)

### Neutrals
- **Gray 900**: `#1A1A1A` (`--text-primary`) - Body text
- **Gray 700**: `#4A4A4A` (`--text-secondary`) - Secondary text
- **Gray 500**: `#666666` (`--text-tertiary`) - Disabled text
- **Gray 300**: `#CCCCCC` (`--border-color`) - Borders, dividers
- **Gray 100**: `#F5F5F5` (`--background-secondary`) - Backgrounds
- **White**: `#FFFFFF` (`--background-primary`)

### Usage Rules
- Always use CSS custom properties, never hardcode hex values
- Maintain minimum 4.5:1 contrast ratio for text (WCAG AA)
- Use semantic color variables for status indicators
- Test colors in both light and dark contexts

## Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-monospace: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
```

### Type Scale & Hierarchy

#### Headings
```css
/* H1 - Page titles */
font-size: 32px;
line-height: 40px;
font-weight: 700;
letter-spacing: -0.5px;

/* H2 - Section headings */
font-size: 24px;
line-height: 32px;
font-weight: 600;
letter-spacing: -0.25px;

/* H3 - Subsection headings */
font-size: 20px;
line-height: 28px;
font-weight: 600;

/* H4 - Card titles */
font-size: 18px;
line-height: 24px;
font-weight: 600;
```

#### Body Text
```css
/* Body Large */
font-size: 18px;
line-height: 28px;
font-weight: 400;

/* Body Default */
font-size: 16px;
line-height: 24px;
font-weight: 400;

/* Body Small */
font-size: 14px;
line-height: 20px;
font-weight: 400;

/* Caption */
font-size: 12px;
line-height: 16px;
font-weight: 400;
color: var(--text-secondary);
```

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Headings, labels
- **Bold**: 700 - Primary headings, strong emphasis

## Spacing System

All spacing must be multiples of 8px (base unit).

### Scale
- `--space-1`: 4px (half unit, rare use)
- `--space-2`: 8px (tight spacing)
- `--space-3`: 16px (default spacing)
- `--space-4`: 24px (comfortable spacing)
- `--space-5`: 32px (section spacing)
- `--space-6`: 48px (large gaps)
- `--space-7`: 64px (page sections)
- `--space-8`: 96px (major sections)

### Common Patterns
```scss
// Component padding
.card {
  padding: var(--space-4); // 24px
}

// Stack spacing
.stack > * + * {
  margin-top: var(--space-3); // 16px
}

// Grid gaps
.grid {
  gap: var(--space-3); // 16px
}
```

## Layout Grid

### Breakpoints
```scss
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;
```

### Container Widths
- **Mobile**: 100% (with 16px padding)
- **Tablet**: 720px
- **Desktop**: 960px
- **Wide**: 1140px
- **Ultra-wide**: 1320px

## Component Patterns

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Get Started</button>
```
- Background: `var(--primary-color)`
- Text: White
- Padding: 12px 24px
- Border radius: 4px
- Font size: 16px, weight 600

#### Secondary Button
```html
<button class="btn btn-secondary">Learn More</button>
```
- Background: Transparent
- Border: 2px solid `var(--primary-color)`
- Text: `var(--primary-color)`

### Form Inputs
```html
<input type="text" class="form-control" placeholder="Enter value">
```
- Height: 40px
- Padding: 10px 16px
- Border: 1px solid `var(--border-color)`
- Border radius: 4px
- Focus: 2px outline `var(--primary-color)`

### Cards
```html
<div class="card">
  <div class="card-header">Title</div>
  <div class="card-body">Content</div>
</div>
```
- Background: White
- Border: 1px solid `var(--border-color)`
- Border radius: 8px
- Padding: 24px
- Shadow: `0 2px 8px rgba(0,0,0,0.1)`

## Icons

### Library
Use Angular Material Icons or Font Awesome

### Sizing
- **Small**: 16px
- **Default**: 24px
- **Large**: 32px
- **Hero**: 48px

### Color
- Match text color by default
- Use `var(--primary-color)` for interactive icons
- Use semantic colors for status icons

## Elevation & Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.2);
```

Use elevation to indicate hierarchy and interaction states.

## Border Radius

```css
--radius-sm: 4px;  // Buttons, inputs
--radius-md: 8px;  // Cards, modals
--radius-lg: 12px; // Large containers
--radius-full: 9999px; // Pills, avatars
```

## Animation & Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

### Usage
```css
.button {
  transition: background-color var(--transition-base);
}
```

## Accessibility Requirements

- Minimum touch target: 44x44px
- Minimum text contrast: 4.5:1 (AA standard)
- Focus indicators must be visible
- Interactive elements must have hover/focus states
- Use semantic HTML elements
- Include ARIA labels for icon-only buttons
