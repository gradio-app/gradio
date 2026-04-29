---
name: gradio-themes
description: Build and customise Gradio themes. Use when creating, editing, or publishing Python-based Gradio themes that control colours, typography, spacing, shadows, and dark mode.
---

# Gradio Theme Building

You are an expert at building Gradio themes. Themes control the entire visual identity of a Gradio app — colours, typography, spacing, shadows, and dark mode — through Python classes that compile to CSS custom properties.

## Core Principles

1. **Text contrast is non-negotiable.** Every text element must be readable against its actual background — body text, label text on coloured label fills, button text on button fills, placeholder text, selected checkbox text, error text, link text. A beautiful theme that can't be read is useless. Audit every text/background pair before shipping.

2. **Dark mode is independently designed.** Never auto-invert light values. Every `_dark` variable should be intentionally chosen for contrast and readability on dark backgrounds. Specifically:
   - Reduce font weight slightly on dark (350 instead of 400) — light text on dark reads heavier
   - Desaturate accents — high chroma at high lightness looks garish
   - Use lighter surfaces for elevation, not heavier shadows
   - Never use pure black `#000` — use `#0a0a14`-ish dark with a subtle hue cast

3. **Commit to an aesthetic direction.** Bold maximalism and refined minimalism both work — what fails is half-commitment. Pick one tone (editorial, brutal, glass, retro, organic, playful, industrial...) and execute every variable in service of it.

4. **Use variable references (`*name`) for consistency.** When one value should track another, reference it. This keeps themes maintainable and lets users customise constructor params (hues, sizes) and have changes cascade.

5. **Test both modes.** Always verify light AND dark for body, blocks, inputs, buttons, labels, checkboxes, tables, focus states, hover states, selected states.

## Aesthetic Quality

Technical correctness isn't enough. A theme can have every variable set perfectly and still look generic. Apply these checks:

### The "AI Slop" Test
If you showed this theme to someone and said "AI made this," would they immediately believe you? If yes, that's the problem. A distinctive theme makes someone ask *"how was this made?"* not *"which AI made this?"*

### Palette traps to avoid
- **Cyan accents on near-black backgrounds** — the default "AI cyberpunk" look
- **Purple-to-blue gradients** — overused and dated
- **Neon glow on dark mode** — looks "cool" without requiring real design decisions
- **Gradient text on headings/metrics** — decorative, not meaningful
- **Glassmorphism everywhere** — backdrop-blur as decoration rather than purpose
- **Pure black (`#000`) or pure white (`#fff`)** — don't exist in nature; tint everything (even chroma 0.005-0.01 reads as natural)
- **Untinted neutrals** (`colors.gray`, `colors.zinc` straight) — neutrals should hint at the brand hue for subconscious cohesion. Use `colors.slate` if your accent is cool, `colors.stone` if warm.
- **Heavy alpha use** (`rgba(...)` everywhere) — usually means an incomplete palette. Define explicit overlay colours per context. Acceptable for focus rings and frosted glass; suspect everywhere else.
- **Gray text on coloured backgrounds** — washes out. Use a darker shade of the background colour instead.

### Typography traps to avoid
- **Inter, Roboto, Open Sans, Lato, Montserrat** — these are the invisible defaults that signal "AI-generated." Fine for utility themes; lethal for distinctive ones.
- **Better Google Font alternatives**: Instrument Sans, Plus Jakarta Sans, Outfit, Onest, Figtree, DM Sans, Source Sans 3 (sans); Fraunces, Newsreader, Lora (serif/editorial); Chakra Petch, Space Grotesk, JetBrains Mono (technical)
- **Monospace as lazy "technical" shorthand** — only use mono when it actually communicates something
- **Too many font sizes too close together** (12, 13, 14, 15, 16) — creates muddy hierarchy. Use fewer sizes with more contrast (1.25–1.5× ratio).

### Visual detail traps to avoid
- **Generic drop shadows** (`0 2px 4px rgba(0,0,0,0.1)`) — safe, forgettable. If you can clearly see the shadow, it's too strong. Either commit to bold shadows or none.
- **Identical card grids** — every block looking the same shape and weight creates visual monotony.
- **Uniform spacing** — vary tight groupings with generous separations to create rhythm.

### Hierarchy through multiple dimensions
Hierarchy is strongest when 2–3 of {size, weight, colour, position, space} change at once. A bigger label alone is weak; bigger + bolder + more space above is strong. Apply this to `block_label_*` vs `block_title_*` vs `section_header_*`.

## Architecture

Themes inherit from `gradio.themes.Base`, which defines 300+ CSS variables with defaults. Your theme overrides specific variables via `super().set()`.

**Flow:** Python class → `_get_theme_css()` → CSS `:root { --var: val; }` → served at `/theme.css` → consumed by Svelte components via `var(--name)`.

Theme CSS is injected into the `<gradio-app>` shadow DOM. The page's `<body>` is styled separately via `body_background_fill` (applied as `body { background: var(--body-background-fill) }` in the layout).

## Skeleton

```python
from __future__ import annotations
from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes


class MyTheme(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.blue,
        secondary_hue: colors.Color | str = colors.violet,
        neutral_hue: colors.Color | str = colors.slate,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_md,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Instrument Sans", weights=(400, 500, 600, 700)),
            "ui-sans-serif", "system-ui", "sans-serif",
        ),
        font_mono: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("JetBrains Mono"),
            "ui-monospace", "Consolas", "monospace",
        ),
    ):
        super().__init__(
            primary_hue=primary_hue, secondary_hue=secondary_hue,
            neutral_hue=neutral_hue, spacing_size=spacing_size,
            radius_size=radius_size, text_size=text_size,
            font=font, font_mono=font_mono,
        )
        self.name = "my_theme"
        super().set(
            # Override variables here
        )
```

**Always specify `weights=(...)` on `GoogleFont` if using anything outside the default `(400, 600)`.** Browsers will fake-bold missing weights, which looks awful.

## Building Blocks

**Colour palettes** — 22 named palettes, 11 shades each (`c50` lightest → `c950` darkest):
`slate`, `gray`, `zinc`, `stone`, `neutral`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`.

```python
from gradio.themes.utils import colors
colors.blue.c500              # "#3b82f6"
f"{colors.violet.c800}60"     # alpha hex (37.5% opacity)
```

**Sizes** — 7 scales each (`xxs`–`xxl`):
`radius_none`, `radius_sm`, `radius_md`, `radius_lg`, `radius_xxl`; `spacing_sm/md/lg`; `text_sm/md/lg`. Custom sizes via `Size(xxs=..., xs=..., ...)`.

**Fonts** — `GoogleFont(name, weights=(...))`, `LocalFont(name)`, plain strings for system fonts. Always include fallbacks in tuples.

## Variable Reference System

Use `*variable_name` to reference other theme variables. References resolve recursively at CSS generation time.

```python
input_shadow="*shadow_drop"
button_cancel_text_color="*button_secondary_text_color"
```

**Dark mode references resolve automatically.** Do **not** append `_dark`:
```python
input_shadow_focus_dark="0 0 0 3px *primary_900"      # CORRECT
input_shadow_focus_dark="0 0 0 3px *primary_900_dark" # WRONG — error
```

**Variables accept any CSS value** — colours, gradients, shadows, transforms, transitions, `none`, calc(), spacing tokens (`*spacing_md`).

**Full variable list** is in `gradio/themes/base.py` — search by name. Every variable accepts an optional `_dark` suffix.

### Non-obvious variables worth knowing

- `block_label_*` (media element titles like "Image", "Audio") vs `block_title_*` (form element titles like a Textbox label) — these are *different* and need to be styled together.
- `body_background_fill` paints the actual page `<body>` (full viewport), not just the gradio container. To make the container itself transparent, set `background_fill_primary="transparent"`.
- `button_transform_hover`/`_active` — for `translateY(-2px)` "lift" effects. Pair with `button_*_shadow_hover` for proper depth.
- `button_{size}_*` (large/small) controls padding/radius/text size per size; `button_{variant}_*` (primary/secondary/cancel) controls colours/shadows per variant.
- `checkbox_label_*` is the surrounding pill button, separate from `checkbox_*` (the box itself).
- `stat_background_fill` accepts gradients — useful for confidence bars.

## Custom CSS

Themes can bundle arbitrary CSS via `self.custom_css` (set in `__init__`). It's injected alongside the variables and ships with the theme when published to the Hub.

```python
class MyTheme(Base):
    def __init__(self, ...):
        super().__init__(...)
        self.name = "my_theme"
        self.custom_css = """
            ...
        """
        super().set(...)
```

**Use `custom_css` for things variables can't express:** `backdrop-filter`, tiling background images, custom slider thumbs, pseudo-element decorations, targeting specific Gradio DOM (`.label-wrap`, `button.secondary`, `.reset-button`, `input[type="range"]`).

### Critical gotcha: Shadow DOM scope

Theme CSS is injected inside the `<gradio-app>` shadow DOM. **Selectors targeting `html` or `body` will not work** — those elements live in the light DOM (the actual page document).

To paint the page background, use the `body_background_fill` variable (Gradio applies it to the real `<body>` from `+layout.svelte`). Do *not* try to style `body` from `custom_css`.

```python
# CORRECT — paints actual <body>, full viewport
body_background_fill="linear-gradient(...)"

# WRONG — selector doesn't resolve, gradient never paints
self.custom_css = "body { background: linear-gradient(...) }"
```

### Custom slider thumbs

Must include both webkit and moz prefixes; need `!important` to beat Gradio's defaults:
```css
input[type="range"]::-webkit-slider-thumb,
input[type="range"]::-moz-range-thumb {
    appearance: none !important;
    width: 30px !important;
    height: 30px !important;
    background: url("data:image/png;base64,...") no-repeat center / contain !important;
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
}
```

### Gradio DOM selectors

Generic class names (no Svelte hashes on these): `.gradio-container`, `.block`, `.panel`, `.form`, `.wrap`, `.label-wrap`, `button.primary`, `button.secondary`, `.reset-button`, `input[type="range"]`. Dark mode: `.dark .xxx`. Inspect the live DOM to find anything else — class names with hashes can change between versions.

## Building from a Reference Image

When matching a screenshot:

1. **Extract**: background (solid/gradient/texture, exact colours), card style (border, radius, shadow), text weight/colour, accent hue, font feel, distinctive elements.
2. **Map**: bg → `body_background_fill`; cards → `block_*`; buttons → `button_*` + `custom_css` for complex gradients/glows; accent → custom `Color()` if no palette matches.
3. **Build order**: background → blocks → buttons → inputs/labels → details (slider thumbs, focus rings).
4. **Pitfalls**: large border-radius + Gradio's `overflow: hidden` clips content (cap at ~20px); complex multi-stop button gradients need `custom_css` with `!important`; backdrop-filter doesn't work in Firefox by default.

## Pre-Shipping Checklist

1. `self.name` set in `__init__`
2. **Text contrast audit** (do this first):
   - Body text on body/block backgrounds
   - Label text on coloured label fills (contrast against the *fill*, not the page)
   - Button text on button fills (all 3 variants: primary, secondary, cancel)
   - Placeholder text — visible but distinct from entered text (≥ #999 on white)
   - Selected checkbox/radio text on selected fill
   - Error text on error background
   - Link text on body background
3. Light mode: body, blocks, inputs, buttons, labels, checkboxes, tables
4. Dark mode: same elements, *independently designed* (not auto-inverted)
5. Focus, hover, active, selected states all 3 button variants
6. **Aesthetic Quality pass**: AI slop test, no palette/typography traps, hierarchy works at squint distance
7. Font weights all explicitly loaded via `weights=(...)`
8. Test with `gr.themes.builder()` for interactive preview

## Publishing

```python
theme.push_to_hub(
    repo_name="my-theme",
    org_name="my-org",
    version="0.0.1",
    description="A bold theme for data dashboards.",
)

# Load
theme = gr.themes.Theme.from_hub("my-org/my-theme@1.2.0")
```

`custom_css` is bundled automatically. Save/load locally via `theme.dump("my_theme.json")` / `Theme.load(...)`.

## Registering a Built-in Theme

1. Create `gradio/themes/my_theme.py`
2. Add `from gradio.themes.my_theme import MyTheme` to `gradio/themes/__init__.py` and add `"MyTheme"` to `__all__`
3. Set `self.name = "my_theme"` in `__init__`

## Reference: Exemplar Theme Files

Read these directly for concrete patterns. Do not re-implement what exists:

| Theme | Style | Techniques to study |
|-------|-------|---------------------|
| `gradio/themes/soft.py` | Minimal, soft | Shadow-based depth, no block borders, rounded labels |
| `gradio/themes/cyberpunk.py` | Bold, neon | Custom hex dark backgrounds, neon glow shadows, alpha colours |
| `gradio/themes/neon.py` | Playful, raised | Bottom-edge shadows, transform hover/active, pill shapes |
| `gradio/themes/ember.py` | Warm, polished | Comprehensive coverage, focus ring shadows |
| `gradio/themes/ocean.py` | Gradient, fluid | CSS gradients in buttons + checkbox labels, scale transforms |
| `gradio/themes/glass.py` | Editorial, subtle | Gradient fills on inputs/buttons, system fonts |
| `gradio/themes/monochrome.py` | Sharp, no colour | All neutral hues, serif font, sharp radius, thick borders |
| `gradio/themes/default.py` | Balanced, standard | Orange+blue dual hue, stat gradients, error colours |