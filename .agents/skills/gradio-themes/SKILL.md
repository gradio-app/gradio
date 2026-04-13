---
name: gradio-themes
description: Build and customise Gradio themes. Use when creating, editing, or publishing Python-based Gradio themes that control colours, typography, spacing, shadows, and dark mode.
---

# Gradio Theme Building

You are an expert at building Gradio themes. Themes control the entire visual identity of a Gradio app — colours, typography, spacing, shadows, and dark mode — through Python classes that compile to CSS custom properties.

## Core Principles

1. **Dark mode is independently designed.** Never auto-invert light values. Every `_dark` variable should be intentionally chosen for contrast and readability on dark backgrounds.

2. **Every theme tells a story.** A theme is not a colour swap. Choose fonts, shadows, border radii, and spacing that work together to create a coherent personality.

3. **Contrast drives clarity.** Interactive elements (buttons, inputs, labels) must be immediately distinguishable from their surroundings in both modes.

4. **Use variable references (`*name`) for consistency.** When one value should track another, reference it rather than duplicating the raw value. This keeps themes maintainable.

5. **Test both modes.** Always verify that light and dark variants look correct. Pay special attention to text contrast on backgrounds, focus states, and hover states.

## Architecture

Themes are Python classes that inherit from `gradio.themes.Base`. The `Base` class defines 300+ CSS variables with sensible defaults. Your theme overrides specific variables via `super().set()`.

```
gradio/themes/
├── base.py          # ThemeClass + Base (all CSS variable definitions)
├── utils/
│   ├── colors.py    # Color class (11 shades: c50–c950) + 20 named palettes
│   ├── sizes.py     # Size class (7 scales: xxs–xxl) + presets
│   └── fonts.py     # Font, GoogleFont, LocalFont classes
├── soft.py          # Example: soft shadows, rounded, Montserrat
├── cyberpunk.py     # Example: neon glows, hard edges, Chakra Petch
├── neon.py, ember.py, ocean.py, ...
```

**Flow:** Python theme class → `_get_theme_css()` → CSS `:root { --var: val; }` → served at `/theme.css` → consumed by Svelte components via `var(--name)`.

## Creating a Theme

### Minimal skeleton

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
        secondary_hue: colors.Color | str = colors.blue,
        neutral_hue: colors.Color | str = colors.gray,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_md,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Inter"),
            "ui-sans-serif",
            "system-ui",
            "sans-serif",
        ),
        font_mono: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("JetBrains Mono"),
            "ui-monospace",
            "Consolas",
            "monospace",
        ),
    ):
        super().__init__(
            primary_hue=primary_hue,
            secondary_hue=secondary_hue,
            neutral_hue=neutral_hue,
            spacing_size=spacing_size,
            radius_size=radius_size,
            text_size=text_size,
            font=font,
            font_mono=font_mono,
        )
        self.name = "my_theme"
        super().set(
            # Override specific variables here
        )
```

### Using the theme

```python
import gradio as gr

theme = MyTheme()

with gr.Blocks(theme=theme) as demo:
    gr.Markdown("# Hello")
    gr.Textbox(label="Input")
    gr.Button("Submit", variant="primary")

demo.launch()
```

## Available Building Blocks

### Colour palettes (`colors`)

20 named palettes, each with 11 shades (`c50` lightest → `c950` darkest):

`slate`, `gray`, `zinc`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

```python
from gradio.themes.utils import colors

colors.blue.c500    # "#3b82f6"
colors.fuchsia.c900 # "#701a75"

# Use in set() with alpha:
f"{colors.violet.c800}60"  # 60 = hex alpha (37.5% opacity)
```

### Size presets (`sizes`)

Each has 7 scales: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`.

| Category | Presets |
|----------|---------|
| `spacing_` | `spacing_sm`, `spacing_md`, `spacing_lg` |
| `radius_` | `radius_sm`, `radius_md`, `radius_lg`, `radius_xxl` |
| `text_` | `text_sm`, `text_md`, `text_lg` |

### Font types (`fonts`)

```python
fonts.GoogleFont("Inter")          # Loaded from Google Fonts CDN
fonts.LocalFont("Montserrat")      # References /static/fonts/
fonts.Font("system-ui")            # System font (no loading)
"sans-serif"                       # Plain string works too
```

## Variable Reference

Use `*variable_name` syntax to reference other theme variables. References are resolved recursively. Dark mode references are automatic — do **not** append `_dark` in the value.

```python
super().set(
    input_shadow="*shadow_drop",                 # references shadow_drop
    block_title_radius="*block_label_radius",    # tracks label radius
    button_cancel_text_color="*button_secondary_text_color",
)
```

### Key variable groups

Every variable accepts an optional `_dark` suffix for dark mode. Below are the most commonly overridden variables, grouped by area.

**Body**
- `body_background_fill` — page background
- `body_text_color` — default text colour
- `body_text_color_subdued` — muted/secondary text

**Backgrounds**
- `background_fill_primary` — primary surface colour
- `background_fill_secondary` — secondary surface colour

**Shadows**
- `shadow_drop` — default drop shadow
- `shadow_drop_lg` — larger drop shadow
- `shadow_inset` — inset shadow (pressed states)
- `shadow_spread` — shadow spread radius

**Blocks** (component wrappers)
- `block_background_fill`, `block_border_color`, `block_border_width`
- `block_shadow`, `block_radius`, `block_padding`
- `block_label_background_fill`, `block_label_text_color`, `block_label_text_weight`
- `block_label_radius`, `block_label_padding`
- `block_title_*` — mirrors block_label for title elements

**Inputs**
- `input_background_fill`, `input_border_color`, `input_border_width`
- `input_shadow`, `input_shadow_focus`
- `input_border_color_focus`, `input_background_fill_focus`
- `input_radius`, `input_padding`, `input_text_size`

**Buttons** (primary / secondary / cancel)
- `button_primary_background_fill`, `button_primary_text_color`
- `button_primary_background_fill_hover`, `button_primary_border_color`
- `button_primary_shadow`, `button_primary_shadow_hover`, `button_primary_shadow_active`
- Same pattern for `button_secondary_*` and `button_cancel_*`
- `button_border_width`, `button_transition`
- `button_large_padding`, `button_large_radius`, `button_large_text_size`
- `button_small_*` and `button_medium_*` — same pattern

**Checkboxes & Radio**
- `checkbox_background_color_selected`, `checkbox_border_color`
- `checkbox_label_background_fill_selected`, `checkbox_label_text_color_selected`
- `checkbox_label_shadow`, `checkbox_label_border_*`
- `checkbox_border_width`

**Tables**
- `table_even_background_fill`, `table_odd_background_fill`
- `table_border_color`, `table_row_focus`

**Other**
- `slider_color` — slider track colour
- `color_accent`, `color_accent_soft` — selection highlights
- `loader_color` — loading spinner
- `panel_border_color`, `panel_border_width`, `panel_background_fill`
- `error_background_fill`, `error_border_color`, `error_text_color`
- `link_text_color`, `link_text_color_hover`, `link_text_color_visited`

## Registering a Built-in Theme

1. Create `gradio/themes/my_theme.py` with your theme class
2. Add to `gradio/themes/__init__.py`:
   ```python
   from gradio.themes.my_theme import MyTheme
   ```
3. Set `self.name = "my_theme"` in your `__init__`

## Publishing to HuggingFace Hub

```python
theme = MyTheme()
theme.push_to_hub(
    repo_name="my-theme",
    org_name="my-org",        # optional, defaults to your HF username
    version="0.0.1",          # optional, auto-increments
    theme_name="My Theme",
    description="A bold theme for data dashboards.",
)
```

Loading from Hub:
```python
theme = gr.themes.Theme.from_hub("my-org/my-theme")
# Pin to a version:
theme = gr.themes.Theme.from_hub("my-org/my-theme@1.2.0")
```

## Theme Design Patterns

### Bold & maximalist (e.g. Cyberpunk)
- Hard edges: `radius_size=sizes.radius_sm`, `block_label_radius="0"`
- Thick borders: `block_border_width="2px"`, `input_border_width="2px"`
- No shadows in light, neon glow in dark: `shadow_drop="none"`, `button_primary_shadow_dark=f"0 0 12px -2px {colors.fuchsia.c500}50"`
- Display fonts: `fonts.GoogleFont("Chakra Petch")`

### Refined & minimal (e.g. Soft)
- Rounded: `radius_size=sizes.radius_md`
- No borders: `block_border_width="0px"`
- Soft shadows: `shadow_drop="0 1px 4px 0 rgb(0 0 0 / 0.1)"`
- Classic fonts: `fonts.LocalFont("Montserrat")`

### Custom hex with alpha

Gradio themes use standard CSS colour values. For transparency, append hex alpha to colour values:

```python
f"{colors.violet.c800}60"   # 37.5% opacity
f"{colors.cyan.c900}80"     # 50% opacity
f"{colors.red.c700}40"      # 25% opacity
```

## Reference: Exemplar Theme Files

Study these for patterns and quality:
- `gradio/themes/soft.py` — minimal overrides, soft shadows, clean
- `gradio/themes/cyberpunk.py` — comprehensive overrides, neon dark mode, bold
- `gradio/themes/ocean.py` — balanced, nature-inspired
