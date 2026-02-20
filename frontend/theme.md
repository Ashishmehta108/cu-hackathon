# Awaaz UI Theme Guidelines

This document outlines the design principles, color palette, and typography for the Awaaz frontend, ensuring a **subtle, polished, and professional** user interface. Our theme is driven by the global CSS variables defined in `src/index.css`.

## 1. Design Philosophy

The Awaaz UI is built on the principles of **clarity, subtlety, and focus**. 
- **Subtle**: Avoid harsh contrasts where unnecessary. Use muted tones for secondary information and borders to let the primary content stand out without overwhelming the user.
- **Polished**: Consistent spacing, smooth corner radii (`0.5rem`), and responsive typography create a high-quality, professional feel.
- **Accessible**: Maintain legible contrast ratios, especially for text colors (`--foreground`, `--muted-foreground`).

## 2. Typography

We use modern, highly legible fonts to maintain a clean appearance.

- **Sans Serif (Primary)**: `Inter`
  - Used for all standard UI text, headings, buttons, and paragraphs.
  - *Weights*: 400 (Regular), 500 (Medium), 600 (Semibold) for emphasis.
- **Monospace (Code/Data)**: `JetBrains Mono`
  - Used for code snippets, technical data, or numeric tabular data.

## 3. Color Palette

Our application uses HSL (Hue, Saturation, Lightness) variables configured for both Light and Dark modes. Tailwind utility classes seamlessly map to these variables.

### Core Backgrounds & Text
- **Background** (`bg-background`): The primary surface of the app. Pure white in light mode, deep dark gray (almost black) in dark mode.
- **Foreground** (`text-foreground`): The primary text color. High contrast against the background.
- **Muted** (`bg-muted` / `text-muted-foreground`): Used for subtle, non-intrusive elements like secondary container backgrounds, placeholder text, or secondary labels.

### Interactive Elements
- **Primary** (`bg-primary` / `text-primary-foreground`): The main brand color used for dominant call-to-action buttons. It shifts from very dark slate (light mode) to off-white (dark mode) for stark, elegant contrast.
- **Secondary** (`bg-secondary` / `text-secondary-foreground`): A softer alternative to Primary, useful for badges, secondary buttons, or soft active states.
- **Accent** (`bg-accent` / `text-accent-foreground`): Used for hover states on items like dropdown menus and table rows. Very subtle lightness shift.

### Structural Elements
- **Card** (`bg-card`): Surface color for elevated containers.
- **Popover** (`bg-popover`): Surface color for floating elements (dropdowns, tooltips, dialogue boxes).
- **Border & Input** (`border-border` / `bg-input`): Delicate, low-contrast grays used to define boundaries without cluttering the visual field. Always use `border-border` rather than harsh default grays.
- **Ring** (`ring-ring`): The focus ring color. Appears on focused inputs or buttons to ensure accessibility without breaking the polished aesthetic.

### Semantic Colors
- **Destructive** (`bg-destructive`): A subdued red for error states and destructive actions, ensuring warnings are clear but not glaring.
- **Charts** (`bg-chart-1` ... `bg-chart-5`): A harmonious spectrum tailored for data visualization, ensuring distinct readability while fitting into the broader polished palette.

## 4. UI Best Practices for a Polished Feel

To maintain the subtle and polished feel across new components:

1. **Use Muted Tones Wisely**: Instead of aggressive gray backgrounds, use `bg-muted` or `bg-accent` to create distinct areas of the UI.
2. **Delicate Borders**: Use `border` and `border-border` to separate content logically. Avoid thick or dark borders. 
3. **Consistent Radii**: All standard elements (cards, buttons, inputs) should use `rounded-md` or `rounded-lg` (which maps to our base `--radius` of `0.5rem`). Avoid mixing sharp edges with curved ones unless semantically required.
4. **Smooth Transitions**: For hover states, especially on buttons or cards, leverage Tailwind's `transition-colors duration-200 ease-in-out` so changes feel intentional and smooth rather than abrupt.
5. **Generous Whitespace**: Rely on padding (`p-4`, `p-6`) and margins rather than lines to separate content where possible. Whitespace breathes luxury and polish into the interface.

## 5. Usage Example

```tsx
// Example of a subtle, polished card
<div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:bg-accent/50">
  <h3 className="font-semibold text-lg">Polished Title</h3>
  <p className="text-sm text-muted-foreground mt-2">
    This is an example of secondary text that provides context without screaming for attention.
  </p>
  <div className="mt-4 flex gap-2">
    <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90">
      Primary Action
    </button>
    <button className="rounded-md bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80">
      Secondary Action
    </button>
  </div>
</div>
```
