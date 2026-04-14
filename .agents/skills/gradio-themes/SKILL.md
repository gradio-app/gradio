---
name: gradio-themes
description: Build and customise Gradio themes. Use when creating, editing, or publishing Python-based Gradio themes that control colours, typography, spacing, shadows, and dark mode.
---

# Gradio Theme Building

You are an expert at building Gradio themes. Themes control the entire visual identity of a Gradio app — colours, typography, spacing, shadows, and dark mode — through Python classes that compile to CSS custom properties.

## Core Principles

1. **Dark mode is independently designed.** Never auto-invert light values. Every `_dark` variable should be intentionally chosen for contrast and readability on dark backgrounds. Dark variants are a first-class design surface.

2. **Every theme tells a story.** A theme is not a colour swap. Choose fonts, shadows, border radii, and spacing that work together to create a coherent personality and emotional tone.

3. **Contrast drives clarity.** Interactive elements (buttons, inputs, labels) must be immediately distinguishable from their surroundings in both modes. Test text on backgrounds, focus rings, hover states.

4. **Typography carries weight.** Font choice is a core part of each theme's identity. Pair a display/body font with a mono font that shares its personality.

5. **Shadows and depth are intentional.** Some themes use bold shadows for energy (Soft, Ember), others use none for sharpness (Cyberpunk, Monochrome). Never random.

6. **Use variable references (`*name`) for consistency.** When one value should track another, reference it rather than duplicating the raw value. This keeps themes maintainable and allows users to customise constructor params (hues, sizes) and have changes cascade.

7. **Test both modes.** Always verify that light and dark variants look correct. Pay special attention to text contrast, focus states, hover states, and selected states.

## Architecture

Themes are Python classes that inherit from `gradio.themes.Base`. The `Base` class defines 300+ CSS variables with sensible defaults. Your theme overrides specific variables via `super().set()`.

```
gradio/themes/
├── base.py          # ThemeClass + Base (all CSS variable definitions + defaults)
├── __init__.py      # Exports: Default, Soft, Monochrome, Glass, Origin, Citrus, Ocean, Cyberpunk, Neon, Ember
├── utils/
│   ├── colors.py    # Color class (11 shades: c50–c950) + 20 named palettes
│   ├── sizes.py     # Size class (7 scales: xxs–xxl) + presets
│   └── fonts.py     # Font, GoogleFont, LocalFont classes
├── soft.py          # Soft shadows, rounded, Montserrat
├── cyberpunk.py     # Neon glows, hard edges, Chakra Petch
├── neon.py          # Raised buttons, bottom-edge shadows, Lexend
├── ember.py         # Warm, polished, Source Sans 3
├── ocean.py         # Gradient buttons, pill shapes, IBM Plex Sans
├── glass.py         # Gradient fills, editorial, Optima
├── monochrome.py    # No colour, sharp edges, Lora serif
├── default.py       # Orange primary, balanced, Source Sans Pro
├── origin.py        # Citrus-style, clean
├── citrus.py        # Warm citrus tones
├── builder_app.py   # Interactive theme builder UI
└── upload_theme.py  # HuggingFace Hub publishing utilities
```

**Flow:** Python theme class → `_get_theme_css()` → CSS `:root { --var: val; }` → served at `/theme.css` → consumed by Svelte components via `var(--name)`.

## Creating a Theme

### Full skeleton

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
            # Override specific variables here — see Variable Reference below
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

### Using built-in themes

```python
import gradio as gr

# By instance
with gr.Blocks(theme=gr.themes.Soft()) as demo: ...

# By string name
with gr.Blocks(theme="soft") as demo: ...

# Override constructor params
with gr.Blocks(theme=gr.themes.Soft(primary_hue="teal", radius_size="none")) as demo: ...
```

## Available Building Blocks

### Colour palettes (`colors`)

20 named palettes, each with 11 shades (`c50` lightest → `c950` darkest):

`slate`, `gray`, `zinc`, `stone`, `neutral`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`

```python
from gradio.themes.utils import colors

# Access individual shades
colors.blue.c500    # "#3b82f6"
colors.fuchsia.c900 # "#701a75"
colors.slate.c50    # "#f8fafc"

# Use in set() — direct hex value
button_cancel_background_fill=colors.red.c500,

# Use in set() — with hex alpha for transparency
block_border_color_dark=f"{colors.violet.c800}60",   # 37.5% opacity
color_accent_soft_dark=f"{colors.cyan.c900}80",       # 50% opacity
button_cancel_background_fill_hover_dark=f"{colors.red.c900}40",  # 25% opacity
```

**Sample palette values:**

| Palette | c50 | c300 | c500 | c700 | c950 |
|---------|-----|------|------|------|------|
| blue | #eff6ff | #93c5fd | #3b82f6 | #1d4ed8 | #1d3660 |
| red | #fef2f2 | #fca5a5 | #ef4444 | #b91c1c | #6c1e1e |
| green | #f0fdf4 | #86efac | #22c55e | #15803d | #134e28 |
| slate | #f8fafc | #cbd5e1 | #64748b | #334155 | #0a0f1e |
| fuchsia | #fdf4ff | #f0abfc | #d946ef | #a21caf | #701a75 |

### Size presets (`sizes`)

Each has 7 scales: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`.

| Preset | xxs | xs | sm | md | lg | xl | xxl |
|--------|-----|-----|-----|-----|-----|-----|-----|
| `radius_none` | 0px | 0px | 0px | 0px | 0px | 0px | 0px |
| `radius_sm` | 1px | 1px | 2px | 4px | 6px | 8px | 12px |
| `radius_md` | 1px | 2px | 4px | 6px | 8px | 12px | 22px |
| `radius_lg` | 2px | 4px | 6px | 8px | 12px | 16px | 24px |
| `radius_xxl` | 6px | 8px | 10px | 20px | 24px | 28px | 32px |
| `spacing_sm` | 1px | 1px | 2px | 4px | 6px | 9px | 12px |
| `spacing_md` | 1px | 2px | 4px | 6px | 8px | 10px | 16px |
| `spacing_lg` | 2px | 4px | 6px | 8px | 10px | 14px | 28px |
| `text_sm` | 8px | 9px | 11px | 13px | 16px | 20px | 24px |
| `text_md` | 9px | 10px | 12px | 14px | 16px | 22px | 26px |
| `text_lg` | 10px | 12px | 14px | 16px | 20px | 24px | 28px |

You can also create custom sizes:
```python
from gradio.themes.utils.sizes import Size
custom_radius = Size(xxs="0px", xs="1px", sm="3px", md="8px", lg="16px", xl="24px", xxl="48px")
```

### Font types (`fonts`)

```python
from gradio.themes.utils import fonts

# Google Font — loaded from Google Fonts CDN. Specify weights (default: 400, 600).
fonts.GoogleFont("Inter")
fonts.GoogleFont("Chakra Petch")
fonts.GoogleFont("Source Sans 3", weights=(400, 600, 700))

# Local Font — loaded from /static/fonts/ directory. Weights default: 400, 700.
fonts.LocalFont("Montserrat")
fonts.LocalFont("IBM Plex Mono")

# System Font — no loading, just declared. Use for system font stacks.
fonts.Font("system-ui")

# Plain strings also work for system fonts
"ui-sans-serif"
"sans-serif"
"monospace"
```

**Font stacks are tuples.** Always include fallbacks:
```python
font=(
    fonts.GoogleFont("Lexend"),
    "ui-sans-serif",
    "system-ui",
    "sans-serif",
),
font_mono=(
    fonts.GoogleFont("Space Mono"),
    "ui-monospace",
    "Consolas",
    "monospace",
),
```

## Variable Reference System

Use `*variable_name` syntax in `super().set()` to reference other theme variables. References are resolved recursively at CSS generation time.

```python
super().set(
    input_shadow="*shadow_drop",                 # references shadow_drop value
    block_title_radius="*block_label_radius",    # tracks label radius
    button_cancel_text_color="*button_secondary_text_color",  # cancel inherits secondary
)
```

**Important:** Dark mode references are automatic. When a `_dark` variable references `*some_var`, the system resolves `some_var_dark` automatically. Do **not** append `_dark` in the reference value:
```python
# CORRECT
input_shadow_focus_dark="0 0 0 3px *primary_900",

# WRONG — will raise an error
input_shadow_focus_dark="0 0 0 3px *primary_900_dark",
```

### CSS values in variables

Variables accept any valid CSS value:
```python
# Colours
body_background_fill="#0a0416",
button_primary_text_color="white",
body_text_color="*neutral_800",

# Gradients
button_primary_background_fill="linear-gradient(120deg, *secondary_500 0%, *primary_300 60%, *primary_400 100%)",
stat_background_fill="linear-gradient(to right, *primary_400, *primary_200)",

# Shadows
shadow_drop="0 1px 4px 0 rgb(0 0 0 / 0.1)",
button_primary_shadow="0 0 12px -2px *primary_500",
input_shadow_focus=f"0 0 0 2px {colors.fuchsia.c300}",

# Spacing (using theme tokens)
block_label_padding="*spacing_sm *spacing_lg",
button_large_padding="*spacing_lg",

# Transforms
button_transform_hover="scale(1.02)",
button_transform_active="translateY(1px)",

# Transitions
button_transition="all 0.15s ease",

# None
shadow_drop="none",
block_border_width="0px",
```

## Complete Variable Reference

Every variable below accepts an optional `_dark` suffix for dark mode (e.g. `body_background_fill_dark`). Variables are grouped by the area they control.

### Body

| Variable | Description | Default |
|----------|-------------|---------|
| `body_background_fill` | Page background | `*background_fill_primary` |
| `body_text_color` | Default text colour | `*neutral_800` |
| `body_text_size` | Default text size | `*text_md` |
| `body_text_color_subdued` | Muted/secondary text | `*neutral_600` |
| `body_text_weight` | Default text weight | `"400"` |
| `embed_radius` | Corner radius when embedded in a page | `*radius_sm` |

### Element Colours

| Variable | Description | Default |
|----------|-------------|---------|
| `background_fill_primary` | Primary surface colour | `white` |
| `background_fill_secondary` | Secondary surface colour | `*neutral_50` |
| `border_color_accent` | Accented border colour | `*primary_300` |
| `border_color_accent_subdued` | Subdued accent border | `*primary_200` |
| `border_color_primary` | Primary border colour | `*neutral_200` |
| `color_accent` | Accent colour (selections, highlights) | `*primary_500` |
| `color_accent_soft` | Softer accent for backgrounds | `*primary_50` |

### Text & Links

| Variable | Description |
|----------|-------------|
| `link_text_color` | Link text colour |
| `link_text_color_active` | Active link colour |
| `link_text_color_hover` | Hovered link colour |
| `link_text_color_visited` | Visited link colour |
| `prose_text_size` | Markdown/prose text size |
| `prose_text_weight` | Markdown/prose text weight |
| `prose_header_text_weight` | Markdown header weight |
| `code_background_fill` | Code block background |

### Shadows

| Variable | Description | Default |
|----------|-------------|---------|
| `shadow_drop` | Default drop shadow | `"0 1px 2px 0 rgb(0 0 0 / 0.05)"` |
| `shadow_drop_lg` | Larger drop shadow | `"0 1px 3px 0 rgb(0 0 0 / 0.1), ..."` |
| `shadow_inset` | Inset shadow (pressed states) | `"rgba(0,0,0,0.05) 0px 2px 4px 0px inset"` |
| `shadow_spread` | Shadow spread radius | `"3px"` |

### Blocks (component wrappers)

| Variable | Description |
|----------|-------------|
| `block_background_fill` | Block background |
| `block_border_color` | Block border colour |
| `block_border_width` | Block border width |
| `block_shadow` | Block shadow |
| `block_radius` | Block corner radius |
| `block_padding` | Block inner padding |
| `block_info_text_color` | Info text colour |
| `block_info_text_size` | Info text size |
| `block_info_text_weight` | Info text weight |

### Block Labels (media element titles)

| Variable | Description |
|----------|-------------|
| `block_label_background_fill` | Label background |
| `block_label_border_color` | Label border colour |
| `block_label_border_width` | Label border width |
| `block_label_shadow` | Label shadow |
| `block_label_text_color` | Label text colour |
| `block_label_text_weight` | Label text weight |
| `block_label_text_size` | Label text size |
| `block_label_margin` | Label margin from container |
| `block_label_padding` | Label inner padding |
| `block_label_radius` | Label corner radius |
| `block_label_right_radius` | Right-aligned helper label radius |

### Block Titles (form element titles)

Same pattern as labels: `block_title_background_fill`, `block_title_border_color`, `block_title_border_width`, `block_title_text_color`, `block_title_text_weight`, `block_title_text_size`, `block_title_padding`, `block_title_radius`.

### Layout

| Variable | Description |
|----------|-------------|
| `container_radius` | Layout component corner radius |
| `form_gap_width` | Gap between form elements |
| `layout_gap` | Gap between items in a row/column |
| `panel_background_fill` | Panel background |
| `panel_border_color` | Panel border colour |
| `panel_border_width` | Panel border width |
| `section_header_text_size` | Section header (tab) text size |
| `section_header_text_weight` | Section header text weight |

### Inputs

| Variable | Description |
|----------|-------------|
| `input_background_fill` | Input background |
| `input_background_fill_focus` | Input background when focused |
| `input_background_fill_hover` | Input background on hover |
| `input_border_color` | Input border colour |
| `input_border_color_focus` | Input border when focused |
| `input_border_color_hover` | Input border on hover |
| `input_border_width` | Input border width |
| `input_padding` | Input padding |
| `input_placeholder_color` | Placeholder text colour |
| `input_radius` | Input corner radius |
| `input_shadow` | Input shadow |
| `input_shadow_focus` | Input shadow when focused |
| `input_text_size` | Input text size |
| `input_text_weight` | Input text weight |

### Buttons

**Shared button properties:**

| Variable | Description |
|----------|-------------|
| `button_border_width` | Border width for all buttons |
| `button_transition` | Transition animation (e.g. `"all 0.15s ease"`) |
| `button_transform_hover` | Transform on hover (e.g. `"scale(1.02)"`, `"translateY(-2px)"`) |
| `button_transform_active` | Transform when pressed (e.g. `"translateY(1px)"`) |

**Size-specific button properties** (for `large`, `medium`, `small`):

`button_{size}_padding`, `button_{size}_radius`, `button_{size}_text_size`, `button_{size}_text_weight`

**Variant-specific button properties** (for `primary`, `secondary`, `cancel`):

Each variant has these properties:
- `button_{variant}_background_fill` — background
- `button_{variant}_background_fill_hover` — hover background
- `button_{variant}_border_color` — border colour
- `button_{variant}_border_color_hover` — hover border colour
- `button_{variant}_text_color` — text colour
- `button_{variant}_text_color_hover` — hover text colour
- `button_{variant}_shadow` — shadow
- `button_{variant}_shadow_hover` — hover shadow
- `button_{variant}_shadow_active` — pressed shadow

All of these accept `_dark` suffixes.

### Checkboxes & Radio

| Variable | Description |
|----------|-------------|
| `checkbox_background_color` | Checkbox/radio background |
| `checkbox_background_color_focus` | Background when focused |
| `checkbox_background_color_hover` | Background on hover |
| `checkbox_background_color_selected` | Background when selected |
| `checkbox_border_color` | Border colour |
| `checkbox_border_color_focus` | Border when focused |
| `checkbox_border_color_hover` | Border on hover |
| `checkbox_border_color_selected` | Border when selected |
| `checkbox_border_radius` | Corner radius |
| `checkbox_border_width` | Border width |
| `checkbox_check` | Checkmark visual |
| `radio_circle` | Radio circle visual |
| `checkbox_shadow` | Shadow |

**Checkbox label (surrounding button):**

`checkbox_label_background_fill`, `_hover`, `_selected`, `checkbox_label_border_color`, `_hover`, `_selected`, `checkbox_label_border_width`, `checkbox_label_gap`, `checkbox_label_padding`, `checkbox_label_shadow`, `_hover`, `_active`, `checkbox_label_text_size`, `checkbox_label_text_weight`, `checkbox_label_text_color`, `_selected`.

All accept `_dark` suffixes.

### Tables

| Variable | Description |
|----------|-------------|
| `table_border_color` | Table border colour |
| `table_even_background_fill` | Even row background |
| `table_odd_background_fill` | Odd row background |
| `table_radius` | Table corner radius |
| `table_row_focus` | Focused row background |
| `table_text_color` | Table text colour |

### Errors

| Variable | Description |
|----------|-------------|
| `error_background_fill` | Error message background |
| `error_border_color` | Error border colour |
| `error_border_width` | Error border width |
| `error_text_color` | Error text colour |
| `error_icon_color` | Error icon colour |

### Other

| Variable | Description |
|----------|-------------|
| `slider_color` | Slider track colour |
| `loader_color` | Loading spinner colour |
| `stat_background_fill` | Stats/confidence bar background (accepts gradients) |
| `accordion_text_color` | Accordion body text |
| `chatbot_text_size` | Chatbot text size |

## Theme Design Patterns

### Pattern 1: Bold & Maximalist (Cyberpunk, Neon)

High energy, strong colour, dramatic shadows or depth effects.

**Cyberpunk approach** — neon glow in dark mode, hard edges:
```python
primary_hue=colors.fuchsia,
secondary_hue=colors.cyan,
radius_size=sizes.radius_sm,        # hard edges
super().set(
    body_background_fill_dark="#0a0416",  # deep violet dark
    block_border_width="2px",
    block_label_radius="0",
    shadow_drop="none",                   # no shadows in light
    shadow_drop_lg="none",
    # Neon glow in dark mode
    button_primary_shadow_dark=f"0 0 12px -2px {colors.fuchsia.c500}50",
    button_primary_shadow_hover_dark=f"0 0 20px -2px {colors.fuchsia.c500}60",
    input_shadow_focus_dark=f"0 0 0 2px {colors.fuchsia.c500}80, 0 0 16px -2px {colors.fuchsia.c600}30",
    # Violet-tinted dark backgrounds
    background_fill_primary_dark="#110b22",
    background_fill_secondary_dark="#1a1030",
    block_background_fill_dark="#110b22",
)
```

**Neon approach** — raised buttons with bottom-edge shadows, press-down on click:
```python
primary_hue=colors.lime,
secondary_hue=colors.cyan,
spacing_size=sizes.spacing_lg,
radius_size=sizes.radius_xxl,       # pill shapes
super().set(
    block_shadow="0px 3px 0px 0px *neutral_300",
    block_shadow_dark="0px 3px 0px 0px *neutral_800",
    button_transform_hover="translateY(-2px)",
    button_transform_active="translateY(1px)",
    button_primary_shadow="0px 4px 0px 0px *primary_600",
    button_primary_shadow_hover="0px 6px 0px 0px *primary_600",
    button_primary_shadow_active="0px 2px 0px 0px *primary_600",
)
```

### Pattern 2: Refined & Minimal (Soft, Glass)

Restrained palette, editorial elegance, typography-forward.

**Soft approach** — rounded, soft shadows, no block borders:
```python
primary_hue=colors.indigo,
radius_size=sizes.radius_md,
font=fonts.LocalFont("Montserrat"),
super().set(
    block_border_width="0px",
    shadow_drop="0 1px 4px 0 rgb(0 0 0 / 0.1)",
    shadow_drop_lg="0 2px 5px 0 rgb(0 0 0 / 0.1)",
    shadow_spread="6px",
    button_primary_shadow="*shadow_drop_lg",
    button_primary_shadow_active="*shadow_inset",
    input_border_color="*neutral_50",
    input_shadow="*shadow_drop",
    input_shadow_focus="*shadow_drop_lg",
    block_label_radius="*radius_md",
    block_label_text_size="*text_md",
    block_label_text_weight="600",
)
```

**Glass approach** — gradient fills, editorial, small and precise:
```python
spacing_size=sizes.spacing_sm,
radius_size=sizes.radius_sm,
text_size=sizes.text_sm,
font=("Optima", "Candara", "Noto Sans", "source-sans-pro", "sans-serif"),
super().set(
    button_primary_background_fill="linear-gradient(180deg, *primary_100 0%, *primary_200 30%)",
    button_primary_text_color="*body_text_color",
    input_background_fill="linear-gradient(0deg, *secondary_100 0%, white 100%)",
    block_border_width="0px",
    block_border_width_dark="1px",
)
```

### Pattern 3: Gradient Buttons (Ocean)

```python
primary_hue=colors.emerald,
secondary_hue=colors.sky,
radius_size=sizes.radius_xxl,       # pill shapes
super().set(
    button_border_width="0px",
    button_transform_hover="scale(1.02)",
    button_primary_background_fill="linear-gradient(120deg, *secondary_500 0%, *primary_300 60%, *primary_400 100%)",
    button_primary_background_fill_hover="linear-gradient(120deg, *secondary_400 0%, *primary_300 60%, *primary_300 100%)",
    button_primary_text_color="*button_secondary_text_color",
    checkbox_label_background_fill_selected="linear-gradient(120deg, *primary_400 0%, *primary_300 60%, *primary_400 100%)",
)
```

### Pattern 4: Monochrome / No Colour (Monochrome)

```python
primary_hue=colors.neutral,
secondary_hue=colors.neutral,
neutral_hue=colors.neutral,
radius_size=sizes.radius_none,      # sharp edges
spacing_size=sizes.spacing_lg,
font=fonts.GoogleFont("Lora"),      # serif for editorial feel
super().set(
    button_border_width="2px",
    button_primary_border_color="*neutral_900",
    button_primary_background_fill="*neutral_900",
    button_primary_text_color="white",
    button_secondary_border_color="*neutral_900",
    button_secondary_background_fill="white",
    block_shadow="none",
    slider_color="*neutral_900",
)
```

### Pattern 5: Warm & Polished (Ember)

```python
primary_hue=colors.orange,
neutral_hue=colors.stone,
radius_size=sizes.radius_lg,
font=fonts.GoogleFont("Source Sans 3"),
super().set(
    body_background_fill="*neutral_50",
    block_border_width="0px",
    block_shadow="*shadow_drop",
    input_shadow="none",
    input_shadow_focus="0 0 0 3px *primary_100",
    input_shadow_focus_dark="0 0 0 3px *primary_900",
    input_border_color_focus="*primary_400",
    button_border_width="0px",
    button_primary_shadow="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    button_primary_shadow_hover="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    button_cancel_background_fill=colors.red.c500,
    button_cancel_text_color="white",
)
```

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
    version="0.0.1",          # optional, auto-increments if omitted
    theme_name="My Theme",    # optional, defaults to repo_name
    description="A bold theme for data dashboards.",
    private=False,             # set True for private spaces
)
```

Loading from Hub:
```python
# Latest version
theme = gr.themes.Theme.from_hub("my-org/my-theme")

# Pin to a version
theme = gr.themes.Theme.from_hub("my-org/my-theme@1.2.0")
```

Saving/loading locally:
```python
theme.dump("my_theme.json")
theme = gr.themes.Theme.load("my_theme.json")
```

## Checklist: Before Shipping a Theme

1. Set `self.name` in `__init__`
2. Light mode: verify body, blocks, inputs, buttons, labels, checkboxes, tables
3. Dark mode: verify all the same elements — dark is independently designed, not auto-generated
4. Check text contrast on all backgrounds (body, block, input, label, button)
5. Check focus states on inputs and interactive elements
6. Check hover + active states on all three button variants (primary, secondary, cancel)
7. Check selected states on checkboxes and radio buttons
8. Verify font loads correctly (check browser network tab for Google/Local fonts)
9. Test with `gr.themes.builder()` for interactive preview

## Reference: Exemplar Theme Files

Study these for patterns, quality, and coverage:

| Theme | Style | Key Techniques |
|-------|-------|----------------|
| `gradio/themes/soft.py` | Minimal, soft | No borders, shadow-based depth, rounded labels |
| `gradio/themes/cyberpunk.py` | Bold, neon | Custom hex dark backgrounds, neon glow shadows, alpha colours |
| `gradio/themes/neon.py` | Playful, raised | Bottom-edge shadows, transform hover/active, pill shapes |
| `gradio/themes/ember.py` | Warm, polished | Comprehensive coverage, focus ring shadows, clean cancel buttons |
| `gradio/themes/ocean.py` | Gradient, fluid | CSS gradients in buttons + checkbox labels, scale transforms |
| `gradio/themes/glass.py` | Editorial, subtle | Gradient fills on inputs/buttons, small text, system fonts |
| `gradio/themes/monochrome.py` | Sharp, no colour | All neutral hues, serif font, sharp radius, thick borders |
| `gradio/themes/default.py` | Balanced, standard | Orange+blue dual hue, stat gradients, error colours |
