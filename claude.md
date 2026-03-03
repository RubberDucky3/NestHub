# HomeHub Brand & Styling Guidelines

When generating or modifying UI components, CSS, or HTML for the HomeHub project, strictly adhere to the following brand identity, styling rules, and principles.

## 1. Brand Principles

1. **Warm, not clinical**: HomeHub feels like your kitchen, not a spreadsheet. Every surface, every tone should feel lived-in and inviting — like home.
2. **Clear, not complicated**: Busy families don't have time to figure things out. Everything should be obvious at a glance. Reduce, clarify, simplify.
3. **Together, not solo**: Home management is a team sport. The brand celebrates shared effort and collective ownership — not individual productivity.
4. **Calm, not frantic**: Even when there's a lot to do, HomeHub brings order and peace of mind. The visual language should never feel stressful or overwhelming.

## 2. Color Palette

Use these exact hex codes and defined CSS variables for styling:

### Core Brand Colors
- **Clay (Primary)**: `#C8714A`
- **Terra (Primary Dark)**: `#A3462A`
- **Sage (Accent)**: `#7A9E7E`
- **Wheat (Highlight)**: `#E8C98A`

### Neutrals & Backgrounds
- **Cream (Main Background)**: `#FBF8F3`
- **Sand (Alt Background)**: `#F5EFE6`
- **Bark (Text / Dark / Hero bg)**: `#3D2B1F`
- **Warm Gray (Muted Text)**: `#8C7B6B`
- **Light Clay (Borders / Soft bg)**: `#F0D5C4`
- **Moss (Success text)**: `#4F7152`

## 3. Typography

HomeHub uses two primary font families to maintain its warm and structured voice. Include them via Google Fonts: `Fraunces` and `DM Sans`.

**Display / Headings / Wordmark: `Fraunces` (serif)**
- **Weights:** 400 (regular), 600 (semibold), 700 (bold), and italics.
- **Usage:** Section titles, large display text, wordmarks, numbers.
- **CSS:** `font-family: 'Fraunces', serif;`

**Body / UI / Labels: `DM Sans` (sans-serif)**
- **Weights:** 300 (light), 400 (regular), 500 (medium).
- **Usage:** General body copy, UI labels, tags, subtext.
- **CSS:** `font-family: 'DM Sans', sans-serif;`

## 4. UI Components & In-App Feel

Ensure all UI components look premium, friendly, and grounded.

- **Backgrounds & Layouts**: The main app background is `--cream`. Use soft radial gradients for hero or empty states (e.g., blending `--clay` and `--sage` at low opacity over `--bark` or `--cream`).
- **Cards & Containers**:
  - **Background**: `white`
  - **Border radius**: `20px`
  - **Border**: `1px solid var(--light-clay)`
  - **Padding**: Generous (e.g., `28px 32px`)
  - **Box Shadow**: Subtle (e.g., `0 2px 12px rgba(61,43,31,0.08)`)

- **Badges & Tags**:
  - **Shape**: Fully rounded (`border-radius: 100px`)
  - **Typography**: `DM Sans`, Weight `500`, Size `10px` to `13px`
  - **Colors**: Match meaning (e.g., Done: `#E8F5E9` bg / `--moss` text; Today: `--light-clay` bg / `--clay` text; Pending: `#FFF8E7` bg / `#9A7030` text; Default: `--sand` bg / `--warm-gray` text).

- **Progress Bars**:
  - **Height**: `6px`
  - **Border radius**: `10px`
  - **Background track**: `--sand`
  - **Fill**: Linear gradients (e.g., `linear-gradient(90deg, var(--clay), var(--wheat))`).

- **Icons & Graphics**:
  - Wrap icons in soft rounded squares (e.g., `14px` border radius).
  - Use line/stroke-based icons with `2px` stroke width and rounded caps/joins.
  - Colors should complement the badge/card action (e.g., `--clay` on `--light-clay` bg, `--sage` on `#EEF5EF` bg, `#E8C98A` on `#FFF8E7` bg).

- **Dividers**:
  - **Height**: `1px`
  - **Background**: `linear-gradient(90deg, var(--light-clay), transparent)`

## 5. CSS Variables Reference

```css
:root {
  --sand:    #F5EFE6;
  --cream:   #FBF8F3;
  --clay:    #C8714A;
  --terra:   #A3462A;
  --sage:    #7A9E7E;
  --moss:    #4F7152;
  --wheat:   #E8C98A;
  --bark:    #3D2B1F;
  --warm-gray: #8C7B6B;
  --light-clay: #F0D5C4;
}
```
