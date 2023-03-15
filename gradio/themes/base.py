from __future__ import annotations

import re
from typing import Iterable

from gradio.themes.utils import colors, fonts, sizes


class ThemeClass:
    def __init__(self):
        self._stylesheets = []

    def _get_theme_css(self):
        css = {}
        dark_css = {}

        for attr, val in self.__dict__.items():
            if attr.startswith("_"):
                continue
            if val is None:
                if attr.endswith("_dark"):
                    dark_css[attr[:-5]] = None
                    continue
                else:
                    raise ValueError(
                        f"Cannot set '{attr}' to None - only dark mode variables can be None."
                    )
            val = str(val)
            pattern = r"(\*)([\w_]+)(\b)"

            def repl_func(match):
                full_match = match.group(0)
                if full_match.startswith("*") and full_match.endswith("_dark"):
                    raise ValueError(
                        f"Cannot refer '{attr}' to '{val}' - dark variable references are automatically used for dark mode attributes, so do not use the _dark suffix in the value."
                    )
                if (
                    attr.endswith("_dark")
                    and full_match.startswith("*")
                    and attr[:-5] == full_match[1:]
                ):
                    raise ValueError(
                        f"Cannot refer '{attr}' to '{val}' - if dark and light mode values are the same, set dark mode version to None."
                    )

                word = match.group(2)
                word = word.replace("_", "-")
                return f"var(--{word})"

            val = re.sub(pattern, repl_func, val)

            attr = attr.replace("_", "-")

            if attr.endswith("-dark"):
                attr = attr[:-5]
                dark_css[attr] = val
            else:
                css[attr] = val

        for attr, val in css.items():
            if attr not in dark_css:
                dark_css[attr] = val

        css_code = (
            ":root {\n"
            + "\n".join([f"  --{attr}: {val};" for attr, val in css.items()])
            + "\n}"
        )
        dark_css_code = (
            ".dark {\n"
            + "\n".join([f"  --{attr}: {val};" for attr, val in dark_css.items()])
            + "\n}"
        )

        return css_code + "\n" + dark_css_code


class Base(ThemeClass):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.blue,
        secondary_hue: colors.Color | str = colors.blue,
        neutral_hue: colors.Color | str = colors.gray,
        text_size: sizes.Size | str = sizes.text_md,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_md,
        font: fonts.Font
        | str
        | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Source Sans Pro"),
            "ui-sans-serif",
            "system-ui",
            "sans-serif",
        ),
        font_mono: fonts.Font
        | str
        | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("IBM Plex Mono"),
            "ui-monospace",
            "Consolas",
            "monospace",
        ),
    ):
        """
        Parameters:
            primary_hue: The primary hue of the theme. Load a preset, like gradio.themes.colors.green (or just the string "green"), or pass your own gradio.themes.utils.Color object.
            secondary_hue: The secondary hue of the theme. Load a preset, like gradio.themes.colors.green (or just the string "green"), or pass your own gradio.themes.utils.Color object.
            neutral_hue: The neutral hue of the theme, used . Load a preset, like gradio.themes.colors.green (or just the string "green"), or pass your own gradio.themes.utils.Color object.
            text_size: The size of the text. Load a preset, like gradio.themes.sizes.text_sm (or just the string "sm"), or pass your own gradio.themes.utils.Size object.
            spacing_size: The size of the spacing. Load a preset, like gradio.themes.sizes.spacing_sm (or just the string "sm"), or pass your own gradio.themes.utils.Size object.
            radius_size: The radius size of corners. Load a preset, like gradio.themes.sizes.radius_sm (or just the string "sm"), or pass your own gradio.themes.utils.Size object.
            font: The font to use for the theme. Pass a string for a system font, or a gradio.themes.font.GoogleFont object to load a font from Google Fonts. Pass a list of fonts for fallbacks.
            font_mono: The font to use for the theme. Pass a string for a system font, or a gradio.themes.font.GoogleFont object to load a font from Google Fonts. Pass a list of fonts for fallbacks.
        """

        def expand_shortcut(shortcut, mode="color", prefix=None):
            if not isinstance(shortcut, str):
                return shortcut
            if mode == "color":
                for color in colors.Color.all:
                    if color.name == shortcut:
                        return color
                raise ValueError(f"Color shortcut {shortcut} not found.")
            elif mode == "size":
                for size in sizes.Size.all:
                    if size.name == prefix + "_" + shortcut:
                        return size
                raise ValueError(f"Size shortcut {shortcut} not found.")

        primary_hue = expand_shortcut(primary_hue, mode="color")
        secondary_hue = expand_shortcut(secondary_hue, mode="color")
        neutral_hue = expand_shortcut(neutral_hue, mode="color")
        text_size = expand_shortcut(text_size, mode="size", prefix="text")
        spacing_size = expand_shortcut(spacing_size, mode="size", prefix="spacing")
        radius_size = expand_shortcut(radius_size, mode="size", prefix="radius")

        # Hue ranges
        self.primary_50 = primary_hue.c50
        self.primary_100 = primary_hue.c100
        self.primary_200 = primary_hue.c200
        self.primary_300 = primary_hue.c300
        self.primary_400 = primary_hue.c400
        self.primary_500 = primary_hue.c500
        self.primary_600 = primary_hue.c600
        self.primary_700 = primary_hue.c700
        self.primary_800 = primary_hue.c800
        self.primary_900 = primary_hue.c900
        self.primary_950 = primary_hue.c950

        self.secondary_50 = secondary_hue.c50
        self.secondary_100 = secondary_hue.c100
        self.secondary_200 = secondary_hue.c200
        self.secondary_300 = secondary_hue.c300
        self.secondary_400 = secondary_hue.c400
        self.secondary_500 = secondary_hue.c500
        self.secondary_600 = secondary_hue.c600
        self.secondary_700 = secondary_hue.c700
        self.secondary_800 = secondary_hue.c800
        self.secondary_900 = secondary_hue.c900
        self.secondary_950 = secondary_hue.c950

        self.neutral_50 = neutral_hue.c50
        self.neutral_100 = neutral_hue.c100
        self.neutral_200 = neutral_hue.c200
        self.neutral_300 = neutral_hue.c300
        self.neutral_400 = neutral_hue.c400
        self.neutral_500 = neutral_hue.c500
        self.neutral_600 = neutral_hue.c600
        self.neutral_700 = neutral_hue.c700
        self.neutral_800 = neutral_hue.c800
        self.neutral_900 = neutral_hue.c900
        self.neutral_950 = neutral_hue.c950

        # Spacing
        self.spacing_xxs = spacing_size.xxs
        self.spacing_xs = spacing_size.xs
        self.spacing_sm = spacing_size.sm
        self.spacing_md = spacing_size.md
        self.spacing_lg = spacing_size.lg
        self.spacing_xl = spacing_size.xl
        self.spacing_xxl = spacing_size.xxl

        self.radius_xxs = radius_size.xxs
        self.radius_xs = radius_size.xs
        self.radius_sm = radius_size.sm
        self.radius_md = radius_size.md
        self.radius_lg = radius_size.lg
        self.radius_xl = radius_size.xl
        self.radius_xxl = radius_size.xxl

        self.text_xxs = text_size.xxs
        self.text_xs = text_size.xs
        self.text_sm = text_size.sm
        self.text_md = text_size.md
        self.text_lg = text_size.lg
        self.text_xl = text_size.xl
        self.text_xxl = text_size.xxl

        # Font
        if not isinstance(font, Iterable):
            font = [font]
        self._font = [
            fontfam if isinstance(fontfam, fonts.Font) else fonts.Font(fontfam)
            for fontfam in font
        ]
        if not isinstance(font_mono, Iterable):
            font_mono = [font_mono]
        self._font_mono = [
            fontfam if isinstance(fontfam, fonts.Font) else fonts.Font(fontfam)
            for fontfam in font_mono
        ]
        self.font = ", ".join(str(font) for font in self._font)
        self.font_mono = ", ".join(str(font) for font in self._font_mono)

        self._stylesheets = []
        for font in self._font + self._font_mono:
            font_stylesheet = font.stylesheet()
            if font_stylesheet:
                self._stylesheets.append(font_stylesheet)

        self.set()

    def set(
        self,
        *,
        # Core Colors
        background_accent=None,
        background_accent_soft=None,
        background_accent_soft_dark=None,
        background_primary=None,
        background_primary_dark=None,
        background_secondary=None,
        background_secondary_dark=None,
        border_color_accent=None,
        border_color_accent_dark=None,
        border_color_primary=None,
        border_color_primary_dark=None,
        # Text
        link_text_color=None,
        link_text_color_active=None,
        link_text_color_active_dark=None,
        link_text_color_dark=None,
        link_text_color_hover=None,
        link_text_color_hover_dark=None,
        link_text_color_visited=None,
        link_text_color_visited_dark=None,
        prose_text_size=None,
        prose_text_weight=None,
        # Body
        body_background=None,
        body_background_dark=None,
        body_text_color=None,
        body_text_color_dark=None,
        body_text_size=None,
        body_text_color_subdued=None,
        body_text_color_subdued_dark=None,
        body_text_weight=None,
        embed_radius=None,
        # Shadows
        shadow_drop=None,
        shadow_drop_lg=None,
        shadow_inset=None,
        shadow_spread=None,
        shadow_spread_dark=None,
        # Layout Atoms
        block_background=None,
        block_background_dark=None,
        block_border_color=None,
        block_border_color_dark=None,
        block_border_width=None,
        block_border_width_dark=None,
        block_info_color=None,
        block_info_color_dark=None,
        block_info_text_size=None,
        block_info_text_weight=None,
        block_label_background=None,
        block_label_background_dark=None,
        block_label_border_color=None,
        block_label_border_color_dark=None,
        block_label_border_width=None,
        block_label_border_width_dark=None,
        block_label_text_color=None,
        block_label_text_color_dark=None,
        block_label_icon_color=None,
        block_label_margin=None,
        block_label_padding=None,
        block_label_radius=None,
        block_label_right_radius=None,
        block_label_text_size=None,
        block_label_text_weight=None,
        block_padding=None,
        block_radius=None,
        block_shadow=None,
        block_shadow_dark=None,
        block_title_background=None,
        block_title_background_dark=None,
        block_title_border_color=None,
        block_title_border_color_dark=None,
        block_title_border_width=None,
        block_title_border_width_dark=None,
        block_title_text_color=None,
        block_title_text_color_dark=None,
        block_title_padding=None,
        block_title_radius=None,
        block_title_text_size=None,
        block_title_text_weight=None,
        container_radius=None,
        form_gap_width=None,
        layout_gap=None,
        panel_background=None,
        panel_background_dark=None,
        panel_border_color=None,
        panel_border_color_dark=None,
        panel_border_width=None,
        section_header_text_size=None,
        section_header_text_weight=None,
        # Component Atoms
        checkbox_background=None,
        checkbox_background_dark=None,
        checkbox_background_focus=None,
        checkbox_background_focus_dark=None,
        checkbox_background_hover=None,
        checkbox_background_hover_dark=None,
        checkbox_background_selected=None,
        checkbox_background_selected_dark=None,
        checkbox_border_color=None,
        checkbox_border_color_dark=None,
        checkbox_border_color_focus=None,
        checkbox_border_color_focus_dark=None,
        checkbox_border_color_hover=None,
        checkbox_border_color_hover_dark=None,
        checkbox_border_color_selected=None,
        checkbox_border_color_selected_dark=None,
        checkbox_border_radius=None,
        checkbox_border_width=None,
        checkbox_label_background=None,
        checkbox_label_background_dark=None,
        checkbox_label_background_hover=None,
        checkbox_label_background_hover_dark=None,
        checkbox_label_background_selected=None,
        checkbox_label_background_selected_dark=None,
        checkbox_label_border_color=None,
        checkbox_label_border_color_dark=None,
        checkbox_label_border_color_hover=None,
        checkbox_label_border_color_hover_dark=None,
        checkbox_label_border_width=None,
        checkbox_label_gap=None,
        checkbox_label_padding=None,
        checkbox_label_shadow=None,
        checkbox_label_text_size=None,
        checkbox_label_text_weight=None,
        checkbox_shadow=None,
        checkbox_text_color=None,
        checkbox_text_color_dark=None,
        checkbox_text_color_selected=None,
        checkbox_text_color_selected_dark=None,
        error_background=None,
        error_background_dark=None,
        error_border_color=None,
        error_border_color_dark=None,
        error_border_width=None,
        error_border_width_dark=None,
        error_color=None,
        error_color_dark=None,
        header_text_weight=None,
        input_background=None,
        input_background_dark=None,
        input_background_focus=None,
        input_background_focus_dark=None,
        input_background_hover=None,
        input_background_hover_dark=None,
        input_border_color=None,
        input_border_color_dark=None,
        input_border_color_focus=None,
        input_border_color_focus_dark=None,
        input_border_color_hover=None,
        input_border_color_hover_dark=None,
        input_border_width=None,
        input_padding=None,
        input_placeholder_color=None,
        input_placeholder_color_dark=None,
        input_radius=None,
        input_shadow=None,
        input_shadow_dark=None,
        input_shadow_focus=None,
        input_shadow_focus_dark=None,
        input_text_size=None,
        input_text_weight=None,
        loader_color=None,
        loader_color_dark=None,
        slider_color=None,
        slider_color_dark=None,
        stat_color_background=None,
        stat_color_background_dark=None,
        table_border_color=None,
        table_border_color_dark=None,
        table_even_background=None,
        table_even_background_dark=None,
        table_odd_background=None,
        table_odd_background_dark=None,
        table_radius=None,
        table_row_focus=None,
        table_row_focus_dark=None,
        # Buttons
        button_border_width=None,
        button_cancel_background=None,
        button_cancel_background_dark=None,
        button_cancel_background_hover=None,
        button_cancel_background_hover_dark=None,
        button_cancel_border_color=None,
        button_cancel_border_color_dark=None,
        button_cancel_border_color_hover=None,
        button_cancel_border_color_hover_dark=None,
        button_cancel_text_color=None,
        button_cancel_text_color_dark=None,
        button_cancel_text_color_hover=None,
        button_cancel_text_color_hover_dark=None,
        button_large_padding=None,
        button_large_radius=None,
        button_large_text_size=None,
        button_large_text_weight=None,
        button_primary_background=None,
        button_primary_background_dark=None,
        button_primary_background_hover=None,
        button_primary_background_hover_dark=None,
        button_primary_border_color=None,
        button_primary_border_color_dark=None,
        button_primary_border_color_hover=None,
        button_primary_border_color_hover_dark=None,
        button_primary_text_color=None,
        button_primary_text_color_dark=None,
        button_primary_text_color_hover=None,
        button_primary_text_color_hover_dark=None,
        button_secondary_background=None,
        button_secondary_background_dark=None,
        button_secondary_background_hover=None,
        button_secondary_background_hover_dark=None,
        button_secondary_border_color=None,
        button_secondary_border_color_dark=None,
        button_secondary_border_color_hover=None,
        button_secondary_border_color_hover_dark=None,
        button_secondary_text_color=None,
        button_secondary_text_color_dark=None,
        button_secondary_text_color_hover=None,
        button_secondary_text_color_hover_dark=None,
        button_shadow=None,
        button_shadow_active=None,
        button_shadow_hover=None,
        button_small_padding=None,
        button_small_radius=None,
        button_small_text_size=None,
        button_small_text_weight=None,
        button_transition=None,
    ):
        # Core Colors
        self.background_accent = background_accent or getattr(
            self, "background_accent", "*primary_500"
        )
        self.background_accent_soft = background_accent_soft or getattr(
            self, "background_accent_soft", "*primary_50"
        )
        self.background_accent_soft_dark = background_accent_soft_dark or getattr(
            self, "background_accent_soft_dark", "*neutral_700"
        )
        self.background_primary = background_primary or getattr(
            self, "background_primary", "white"
        )
        self.background_primary_dark = background_primary_dark or getattr(
            self, "background_primary_dark", "*neutral_950"
        )
        self.background_secondary = background_secondary or getattr(
            self, "background_secondary", "*neutral_50"
        )
        self.background_secondary_dark = background_secondary_dark or getattr(
            self, "background_secondary_dark", "*neutral_900"
        )
        self.border_color_accent = border_color_accent or getattr(
            self, "border_color_accent", "*primary_300"
        )
        self.border_color_accent_dark = border_color_accent_dark or getattr(
            self, "border_color_accent_dark", "*neutral_600"
        )
        self.border_color_primary = border_color_primary or getattr(
            self, "border_color_primary", "*neutral_200"
        )
        self.border_color_primary_dark = border_color_primary_dark or getattr(
            self, "border_color_primary_dark", "*neutral_700"
        )
        # Text Colors
        self.link_text_color = link_text_color or getattr(
            self, "link_text_color", "*secondary_600"
        )
        self.link_text_color_active = link_text_color_active or getattr(
            self, "link_text_color_active", "*secondary_600"
        )
        self.link_text_color_active_dark = link_text_color_active_dark or getattr(
            self, "link_text_color_active_dark", "*secondary_500"
        )
        self.link_text_color_dark = link_text_color_dark or getattr(
            self, "link_text_color_dark", "*secondary_500"
        )
        self.link_text_color_hover = link_text_color_hover or getattr(
            self, "link_text_color_hover", "*secondary_700"
        )
        self.link_text_color_hover_dark = link_text_color_hover_dark or getattr(
            self, "link_text_color_hover_dark", "*secondary_400"
        )
        self.link_text_color_visited = link_text_color_visited or getattr(
            self, "link_text_color_visited", "*secondary_500"
        )
        self.link_text_color_visited_dark = link_text_color_visited_dark or getattr(
            self, "link_text_color_visited_dark", "*secondary_600"
        )
        self.body_text_color_subdued = body_text_color_subdued or getattr(
            self, "body_text_color_subdued", "*neutral_400"
        )
        self.body_text_color_subdued_dark = body_text_color_subdued_dark or getattr(
            self, "body_text_color_subdued_dark", "*neutral_400"
        )
        # Body
        self.body_background = body_background or getattr(
            self, "body_background", "*background_primary"
        )
        self.body_background_dark = body_background_dark or getattr(
            self, "body_background_dark", "*background_primary"
        )
        self.body_text_color = body_text_color or getattr(
            self, "body_text_color", "*neutral_800"
        )
        self.body_text_color_dark = body_text_color_dark or getattr(
            self, "body_text_color_dark", "*neutral_100"
        )
        self.body_text_size = body_text_size or getattr(
            self, "body_text_size", "*text_md"
        )
        self.body_text_weight = body_text_weight or getattr(
            self, "body_text_weight", "400"
        )
        self.embed_radius = embed_radius or getattr(self, "embed_radius", "*radius_lg")
        # Shadows
        self.shadow_drop = shadow_drop or getattr(
            self, "shadow_drop", "rgba(0,0,0,0.05) 0px 1px 2px 0px"
        )
        self.shadow_drop_lg = shadow_drop_lg or getattr(
            self,
            "shadow_drop_lg",
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        )
        self.shadow_inset = shadow_inset or getattr(
            self, "shadow_inset", "rgba(0,0,0,0.05) 0px 2px 4px 0px inset"
        )
        self.shadow_spread = shadow_spread or getattr(self, "shadow_spread", "3px")
        self.shadow_spread_dark = shadow_spread_dark or getattr(
            self, "shadow_spread_dark", "1px"
        )
        # Layout Atoms
        self.block_background = block_background or getattr(
            self, "block_background", "*background_primary"
        )
        self.block_background_dark = block_background_dark or getattr(
            self, "block_background_dark", "*neutral_800"
        )
        self.block_border_color = block_border_color or getattr(
            self, "block_border_color", "*border_color_primary"
        )
        self.block_border_color_dark = block_border_color_dark or getattr(
            self, "block_border_color_dark", "*border_color_primary"
        )
        self.block_border_width = block_border_width or getattr(
            self, "block_border_width", "1px"
        )
        self.block_border_width_dark = block_border_width_dark or getattr(
            self, "block_border_width_dark", None
        )
        self.block_info_color = block_info_color or getattr(
            self, "block_info_color", "*body_text_color_subdued"
        )
        self.block_info_color_dark = block_info_color_dark or getattr(
            self, "block_info_color_dark", "*body_text_color_subdued"
        )
        self.block_info_text_size = block_info_text_size or getattr(
            self, "block_info_text_size", "*text_sm"
        )
        self.block_info_text_weight = block_info_text_weight or getattr(
            self, "block_info_text_weight", "400"
        )
        self.block_label_background = block_label_background or getattr(
            self, "block_label_background", "*background_primary"
        )
        self.block_label_background_dark = block_label_background_dark or getattr(
            self, "block_label_background_dark", "*background_secondary"
        )
        self.block_label_border_color = block_label_border_color or getattr(
            self, "block_label_border_color", "*border_color_primary"
        )
        self.block_label_border_color_dark = block_label_border_color_dark or getattr(
            self, "block_label_border_color_dark", "*border_color_primary"
        )
        self.block_label_border_width = block_label_border_width or getattr(
            self, "block_label_border_width", "1px"
        )
        self.block_label_border_width_dark = block_label_border_width_dark or getattr(
            self, "block_label_border_width_dark", None
        )
        self.block_label_text_color = block_label_text_color or getattr(
            self, "block_label_text_color", "*neutral_500"
        )
        self.block_label_text_color_dark = block_label_text_color_dark or getattr(
            self, "block_label_text_color_dark", "*neutral_200"
        )
        self.block_label_icon_color = block_label_icon_color or getattr(
            self, "block_label_icon_color", "*block_label_text_color"
        )
        self.block_label_margin = block_label_margin or getattr(
            self, "block_label_margin", "0"
        )
        self.block_label_padding = block_label_padding or getattr(
            self, "block_label_padding", "*spacing_sm *spacing_lg"
        )
        self.block_label_radius = block_label_radius or getattr(
            self,
            "block_label_radius",
            "calc(*radius_lg - 1px) 0 calc(*radius_lg - 1px) 0",
        )
        self.block_label_right_radius = block_label_right_radius or getattr(
            self,
            "block_label_right_radius",
            "0 calc(*radius_lg - 1px) 0 calc(*radius_lg - 1px)",
        )
        self.block_label_text_size = block_label_text_size or getattr(
            self, "block_label_text_size", "*text_sm"
        )
        self.block_label_text_weight = block_label_text_weight or getattr(
            self, "block_label_text_weight", "400"
        )
        self.block_padding = block_padding or getattr(
            self, "block_padding", "*spacing_xl calc(*spacing_xl + 2px)"
        )
        self.block_radius = block_radius or getattr(self, "block_radius", "*radius_lg")
        self.block_shadow = block_shadow or getattr(self, "block_shadow", "none")
        self.block_shadow_dark = block_shadow_dark or getattr(
            self, "block_shadow_dark", None
        )
        self.block_title_background = block_title_background or getattr(
            self, "block_title_background", "none"
        )
        self.block_title_background_dark = block_title_background_dark or getattr(
            self, "block_title_background_dark", None
        )
        self.block_title_border_color = block_title_border_color or getattr(
            self, "block_title_border_color", "none"
        )
        self.block_title_border_color_dark = block_title_border_color_dark or getattr(
            self, "block_title_border_color_dark", None
        )
        self.block_title_border_width = block_title_border_width or getattr(
            self, "block_title_border_width", "0px"
        )
        self.block_title_border_width_dark = block_title_border_width_dark or getattr(
            self, "block_title_border_width_dark", None
        )
        self.block_title_text_color = block_title_text_color or getattr(
            self, "block_title_text_color", "*neutral_500"
        )
        self.block_title_text_color_dark = block_title_text_color_dark or getattr(
            self, "block_title_text_color_dark", "*neutral_200"
        )
        self.block_title_padding = block_title_padding or getattr(
            self, "block_title_padding", "0"
        )
        self.block_title_radius = block_title_radius or getattr(
            self, "block_title_radius", "none"
        )
        self.block_title_text_size = block_title_text_size or getattr(
            self, "block_title_text_size", "*text_md"
        )
        self.block_title_text_weight = block_title_text_weight or getattr(
            self, "block_title_text_weight", "400"
        )
        self.container_radius = container_radius or getattr(
            self, "container_radius", "*radius_lg"
        )
        self.form_gap_width = form_gap_width or getattr(self, "form_gap_width", "0px")
        self.layout_gap = layout_gap or getattr(self, "layout_gap", "*spacing_xxl")
        self.panel_background = panel_background or getattr(
            self, "panel_background", "*background_secondary"
        )
        self.panel_background_dark = panel_background_dark or getattr(
            self, "panel_background_dark", "*background_secondary"
        )
        self.panel_border_color = panel_border_color or getattr(
            self, "panel_border_color", "*border_color_primary"
        )
        self.panel_border_color_dark = panel_border_color_dark or getattr(
            self, "panel_border_color_dark", "*border_color_primary"
        )
        self.panel_border_width = panel_border_width or getattr(
            self, "panel_border_width", "0"
        )
        self.section_header_text_size = section_header_text_size or getattr(
            self, "section_header_text_size", "*text_md"
        )
        self.section_header_text_weight = section_header_text_weight or getattr(
            self, "section_header_text_weight", "400"
        )
        # Component Atoms
        self.checkbox_background = checkbox_background or getattr(
            self, "checkbox_background", "*background_primary"
        )
        self.checkbox_background_dark = checkbox_background_dark or getattr(
            self, "checkbox_background_dark", "*neutral_800"
        )
        self.checkbox_background_focus = checkbox_background_focus or getattr(
            self, "checkbox_background_focus", "*checkbox_background"
        )
        self.checkbox_background_focus_dark = checkbox_background_focus_dark or getattr(
            self, "checkbox_background_focus_dark", "*checkbox_background"
        )
        self.checkbox_background_hover = checkbox_background_hover or getattr(
            self, "checkbox_background_hover", "*checkbox_background"
        )
        self.checkbox_background_hover_dark = checkbox_background_hover_dark or getattr(
            self, "checkbox_background_hover_dark", "*checkbox_background"
        )
        self.checkbox_background_selected = checkbox_background_selected or getattr(
            self, "checkbox_background_selected", "*secondary_600"
        )
        self.checkbox_background_selected_dark = (
            checkbox_background_selected_dark
            or getattr(self, "checkbox_background_selected_dark", "*secondary_600")
        )
        self.checkbox_border_color = checkbox_border_color or getattr(
            self, "checkbox_border_color", "*neutral_300"
        )
        self.checkbox_border_color_dark = checkbox_border_color_dark or getattr(
            self, "checkbox_border_color_dark", "*neutral_700"
        )
        self.checkbox_border_color_focus = checkbox_border_color_focus or getattr(
            self, "checkbox_border_color_focus", "*secondary_500"
        )
        self.checkbox_border_color_focus_dark = (
            checkbox_border_color_focus_dark
            or getattr(self, "checkbox_border_color_focus_dark", "*secondary_500")
        )
        self.checkbox_border_color_hover = checkbox_border_color_hover or getattr(
            self, "checkbox_border_color_hover", "*neutral_300"
        )
        self.checkbox_border_color_hover_dark = (
            checkbox_border_color_hover_dark
            or getattr(self, "checkbox_border_color_hover_dark", "*neutral_600")
        )
        self.checkbox_border_color_selected = checkbox_border_color_selected or getattr(
            self, "checkbox_border_color_selected", "*secondary_600"
        )
        self.checkbox_border_color_selected_dark = (
            checkbox_border_color_selected_dark
            or getattr(self, "checkbox_border_color_selected_dark", "*secondary_600")
        )
        self.checkbox_border_radius = checkbox_border_radius or getattr(
            self, "checkbox_border_radius", "*radius_sm"
        )
        self.checkbox_border_width = checkbox_border_width or getattr(
            self, "checkbox_border_width", "*input_border_width"
        )
        self.checkbox_label_background = checkbox_label_background or getattr(
            self, "checkbox_label_background", "*button_secondary_background"
        )
        self.checkbox_label_background_dark = checkbox_label_background_dark or getattr(
            self, "checkbox_label_background_dark", "*button_secondary_background"
        )
        self.checkbox_label_background_hover = (
            checkbox_label_background_hover
            or getattr(
                self,
                "checkbox_label_background_hover",
                "*button_secondary_background_hover",
            )
        )
        self.checkbox_label_background_hover_dark = (
            checkbox_label_background_hover_dark
            or getattr(
                self,
                "checkbox_label_background_hover_dark",
                "*button_secondary_background_hover",
            )
        )
        self.checkbox_label_background_selected = (
            checkbox_label_background_selected
            or getattr(
                self, "checkbox_label_background_selected", "*checkbox_label_background"
            )
        )
        self.checkbox_label_background_selected_dark = (
            checkbox_label_background_selected_dark
            or getattr(
                self,
                "checkbox_label_background_selected_dark",
                "*checkbox_label_background",
            )
        )
        self.checkbox_label_border_color = checkbox_label_border_color or getattr(
            self, "checkbox_label_border_color", "*border_color_primary"
        )
        self.checkbox_label_border_color_dark = (
            checkbox_label_border_color_dark
            or getattr(
                self, "checkbox_label_border_color_dark", "*border_color_primary"
            )
        )
        self.checkbox_label_border_color_hover = (
            checkbox_label_border_color_hover
            or getattr(
                self,
                "checkbox_label_border_color_hover",
                "*checkbox_label_border_color",
            )
        )
        self.checkbox_label_border_color_hover_dark = (
            checkbox_label_border_color_hover_dark
            or getattr(
                self,
                "checkbox_label_border_color_hover_dark",
                "*checkbox_label_border_color",
            )
        )
        self.checkbox_label_border_width = checkbox_label_border_width or getattr(
            self, "checkbox_label_border_width", "*input_border_width"
        )
        self.checkbox_label_gap = checkbox_label_gap or getattr(
            self, "checkbox_label_gap", "*spacing_lg"
        )
        self.checkbox_label_padding = checkbox_label_padding or getattr(
            self, "checkbox_label_padding", "*spacing_md calc(2 * *spacing_md)"
        )
        self.checkbox_label_shadow = checkbox_label_shadow or getattr(
            self, "checkbox_label_shadow", "none"
        )
        self.checkbox_label_text_size = checkbox_label_text_size or getattr(
            self, "checkbox_label_text_size", "*text_md"
        )
        self.checkbox_label_text_weight = checkbox_label_text_weight or getattr(
            self, "checkbox_label_text_weight", "400"
        )
        self.checkbox_shadow = checkbox_shadow or getattr(
            self, "checkbox_shadow", "*input_shadow"
        )
        self.checkbox_text_color = checkbox_text_color or getattr(
            self, "checkbox_text_color", "*body_text_color"
        )
        self.checkbox_text_color_dark = checkbox_text_color_dark or getattr(
            self, "checkbox_text_color_dark", "*body_text_color"
        )
        self.checkbox_text_color_selected = checkbox_text_color_selected or getattr(
            self, "checkbox_text_color_selected", "*checkbox_text_color"
        )
        self.checkbox_text_color_selected_dark = (
            checkbox_text_color_selected_dark
            or getattr(
                self, "checkbox_text_color_selected_dark", "*checkbox_text_color"
            )
        )
        self.error_background = error_background or getattr(
            self, "error_background", colors.red.c100
        )
        self.error_background_dark = error_background_dark or getattr(
            self, "error_background_dark", "*background_primary"
        )
        self.error_border_color = error_border_color or getattr(
            self, "error_border_color", colors.red.c200
        )
        self.error_border_color_dark = error_border_color_dark or getattr(
            self, "error_border_color_dark", "*border_color_primary"
        )
        self.error_border_width = error_border_width or getattr(
            self, "error_border_width", "1px"
        )
        self.error_border_width_dark = error_border_width_dark or getattr(
            self, "error_border_width_dark", None
        )
        self.error_color = error_color or getattr(self, "error_color", colors.red.c500)
        self.error_color_dark = error_color_dark or getattr(
            self, "error_color_dark", colors.red.c500
        )
        self.header_text_weight = header_text_weight or getattr(
            self, "header_text_weight", "600"
        )
        self.input_background = input_background or getattr(
            self, "input_background", "*neutral_100"
        )
        self.input_background_dark = input_background_dark or getattr(
            self, "input_background_dark", "*neutral_700"
        )
        self.input_background_focus = input_background_focus or getattr(
            self, "input_background_focus", "*secondary_500"
        )
        self.input_background_focus_dark = input_background_focus_dark or getattr(
            self, "input_background_focus_dark", "*secondary_600"
        )
        self.input_background_hover = input_background_hover or getattr(
            self, "input_background_hover", "*input_background"
        )
        self.input_background_hover_dark = input_background_hover_dark or getattr(
            self, "input_background_hover_dark", "*input_background"
        )
        self.input_border_color = input_border_color or getattr(
            self, "input_border_color", "*border_color_primary"
        )
        self.input_border_color_dark = input_border_color_dark or getattr(
            self, "input_border_color_dark", "*border_color_primary"
        )
        self.input_border_color_focus = input_border_color_focus or getattr(
            self, "input_border_color_focus", "*secondary_300"
        )
        self.input_border_color_focus_dark = input_border_color_focus_dark or getattr(
            self, "input_border_color_focus_dark", "*neutral_700"
        )
        self.input_border_color_hover = input_border_color_hover or getattr(
            self, "input_border_color_hover", "*input_border_color"
        )
        self.input_border_color_hover_dark = input_border_color_hover_dark or getattr(
            self, "input_border_color_hover_dark", "*input_border_color"
        )
        self.input_border_width = input_border_width or getattr(
            self, "input_border_width", "0px"
        )
        self.input_padding = input_padding or getattr(
            self, "input_padding", "*spacing_xl"
        )
        self.input_placeholder_color = input_placeholder_color or getattr(
            self, "input_placeholder_color", "*neutral_400"
        )
        self.input_placeholder_color_dark = input_placeholder_color_dark or getattr(
            self, "input_placeholder_color_dark", "*neutral_500"
        )
        self.input_radius = input_radius or getattr(self, "input_radius", "*radius_lg")
        self.input_shadow = input_shadow or getattr(self, "input_shadow", "none")
        self.input_shadow_dark = input_shadow_dark or getattr(
            self, "input_shadow_dark", None
        )
        self.input_shadow_focus = input_shadow_focus or getattr(
            self, "input_shadow_focus", "*input_shadow"
        )
        self.input_shadow_focus_dark = input_shadow_focus_dark or getattr(
            self, "input_shadow_focus_dark", None
        )
        self.input_text_size = input_text_size or getattr(
            self, "input_text_size", "*text_md"
        )
        self.input_text_weight = input_text_weight or getattr(
            self, "input_text_weight", "400"
        )
        self.loader_color = loader_color or getattr(
            self, "loader_color", "*background_accent"
        )
        self.loader_color_dark = loader_color_dark or getattr(
            self, "loader_color_dark", None
        )
        self.prose_text_size = prose_text_size or getattr(
            self, "prose_text_size", "*text_md"
        )
        self.prose_text_weight = prose_text_weight or getattr(
            self, "prose_text_weight", "400"
        )
        self.slider_color = slider_color or getattr(self, "slider_color", "")
        self.slider_color_dark = slider_color_dark or getattr(
            self, "slider_color_dark", None
        )
        self.stat_color_background = stat_color_background or getattr(
            self, "stat_color_background", "*primary_300"
        )
        self.stat_color_background_dark = stat_color_background_dark or getattr(
            self, "stat_color_background_dark", "*primary_500"
        )
        self.table_border_color = table_border_color or getattr(
            self, "table_border_color", "*neutral_300"
        )
        self.table_border_color_dark = table_border_color_dark or getattr(
            self, "table_border_color_dark", "*neutral_700"
        )
        self.table_even_background = table_even_background or getattr(
            self, "table_even_background", "white"
        )
        self.table_even_background_dark = table_even_background_dark or getattr(
            self, "table_even_background_dark", "*neutral_950"
        )
        self.table_odd_background = table_odd_background or getattr(
            self, "table_odd_background", "*neutral_50"
        )
        self.table_odd_background_dark = table_odd_background_dark or getattr(
            self, "table_odd_background_dark", "*neutral_900"
        )
        self.table_radius = table_radius or getattr(self, "table_radius", "*radius_lg")
        self.table_row_focus = table_row_focus or getattr(
            self, "table_row_focus", "*background_accent_soft"
        )
        self.table_row_focus_dark = table_row_focus_dark or getattr(
            self, "table_row_focus_dark", "*background_accent_soft"
        )
        # Buttons
        self.button_border_width = button_border_width or getattr(
            self, "button_border_width", "*input_border_width"
        )
        self.button_cancel_background = button_cancel_background or getattr(
            self, "button_cancel_background", "*button_secondary_background"
        )
        self.button_cancel_background_dark = button_cancel_background_dark or getattr(
            self, "button_cancel_background_dark", "*button_secondary_background"
        )
        self.button_cancel_background_hover = button_cancel_background_hover or getattr(
            self, "button_cancel_background_hover", "*button_cancel_background"
        )
        self.button_cancel_background_hover_dark = (
            button_cancel_background_hover_dark
            or getattr(
                self,
                "button_cancel_background_hover_dark",
                "*button_cancel_background",
            )
        )
        self.button_cancel_border_color = button_cancel_border_color or getattr(
            self, "button_cancel_border_color", "*button_secondary_border_color"
        )
        self.button_cancel_border_color_dark = (
            button_cancel_border_color_dark
            or getattr(
                self,
                "button_cancel_border_color_dark",
                "*button_secondary_border_color",
            )
        )
        self.button_cancel_border_color_hover = (
            button_cancel_border_color_hover
            or getattr(
                self,
                "button_cancel_border_color_hover",
                "*button_cancel_border_color",
            )
        )
        self.button_cancel_border_color_hover_dark = (
            button_cancel_border_color_hover_dark
            or getattr(
                self,
                "button_cancel_border_color_hover_dark",
                "*button_cancel_border_color",
            )
        )
        self.button_cancel_text_color = button_cancel_text_color or getattr(
            self, "button_cancel_text_color", "*button_secondary_text_color"
        )
        self.button_cancel_text_color_dark = button_cancel_text_color_dark or getattr(
            self, "button_cancel_text_color_dark", "*button_secondary_text_color"
        )
        self.button_cancel_text_color_hover = button_cancel_text_color_hover or getattr(
            self, "button_cancel_text_color_hover", "*button_cancel_text_color"
        )
        self.button_cancel_text_color_hover_dark = (
            button_cancel_text_color_hover_dark
            or getattr(
                self, "button_cancel_text_color_hover_dark", "*button_cancel_text_color"
            )
        )
        self.button_large_padding = button_large_padding or getattr(
            self, "button_large_padding", "*spacing_lg calc(2 * *spacing_lg)"
        )
        self.button_large_radius = button_large_radius or getattr(
            self, "button_large_radius", "*radius_lg"
        )
        self.button_large_text_size = button_large_text_size or getattr(
            self, "button_large_text_size", "*text_lg"
        )
        self.button_large_text_weight = button_large_text_weight or getattr(
            self, "button_large_text_weight", "600"
        )
        self.button_primary_background = button_primary_background or getattr(
            self, "button_primary_background", "*primary_200"
        )
        self.button_primary_background_dark = button_primary_background_dark or getattr(
            self, "button_primary_background_dark", "*primary_700"
        )
        self.button_primary_background_hover = (
            button_primary_background_hover
            or getattr(
                self, "button_primary_background_hover", "*button_primary_background"
            )
        )
        self.button_primary_background_hover_dark = (
            button_primary_background_hover_dark
            or getattr(
                self,
                "button_primary_background_hover_dark",
                "*button_primary_background",
            )
        )
        self.button_primary_border_color = button_primary_border_color or getattr(
            self, "button_primary_border_color", "*primary_200"
        )
        self.button_primary_border_color_dark = (
            button_primary_border_color_dark
            or getattr(self, "button_primary_border_color_dark", "*primary_600")
        )
        self.button_primary_border_color_hover = (
            button_primary_border_color_hover
            or getattr(
                self,
                "button_primary_border_color_hover",
                "*button_primary_border_color",
            )
        )
        self.button_primary_border_color_hover_dark = (
            button_primary_border_color_hover_dark
            or getattr(
                self,
                "button_primary_border_color_hover_dark",
                "*button_primary_border_color",
            )
        )
        self.button_primary_text_color = button_primary_text_color or getattr(
            self, "button_primary_text_color", "*primary_600"
        )
        self.button_primary_text_color_dark = button_primary_text_color_dark or getattr(
            self, "button_primary_text_color_dark", "white"
        )
        self.button_primary_text_color_hover = (
            button_primary_text_color_hover
            or getattr(
                self, "button_primary_text_color_hover", "*button_primary_text_color"
            )
        )
        self.button_primary_text_color_hover_dark = (
            button_primary_text_color_hover_dark
            or getattr(
                self,
                "button_primary_text_color_hover_dark",
                "*button_primary_text_color",
            )
        )
        self.button_secondary_background = button_secondary_background or getattr(
            self, "button_secondary_background", "*neutral_200"
        )
        self.button_secondary_background_dark = (
            button_secondary_background_dark
            or getattr(self, "button_secondary_background_dark", "*neutral_600")
        )
        self.button_secondary_background_hover = (
            button_secondary_background_hover
            or getattr(
                self,
                "button_secondary_background_hover",
                "*button_secondary_background",
            )
        )
        self.button_secondary_background_hover_dark = (
            button_secondary_background_hover_dark
            or getattr(
                self,
                "button_secondary_background_hover_dark",
                "*button_secondary_background",
            )
        )
        self.button_secondary_border_color = button_secondary_border_color or getattr(
            self, "button_secondary_border_color", "*neutral_200"
        )
        self.button_secondary_border_color_dark = (
            button_secondary_border_color_dark
            or getattr(self, "button_secondary_border_color_dark", "*neutral_600")
        )
        self.button_secondary_border_color_hover = (
            button_secondary_border_color_hover
            or getattr(
                self,
                "button_secondary_border_color_hover",
                "*button_secondary_border_color",
            )
        )
        self.button_secondary_border_color_hover_dark = (
            button_secondary_border_color_hover_dark
            or getattr(
                self,
                "button_secondary_border_color_hover_dark",
                "*button_secondary_border_color",
            )
        )
        self.button_secondary_text_color = button_secondary_text_color or getattr(
            self, "button_secondary_text_color", "*neutral_700"
        )
        self.button_secondary_text_color_dark = (
            button_secondary_text_color_dark
            or getattr(self, "button_secondary_text_color_dark", "white")
        )
        self.button_secondary_text_color_hover = (
            button_secondary_text_color_hover
            or getattr(
                self,
                "button_secondary_text_color_hover",
                "*button_secondary_text_color",
            )
        )
        self.button_secondary_text_color_hover_dark = (
            button_secondary_text_color_hover_dark
            or getattr(
                self,
                "button_secondary_text_color_hover_dark",
                "*button_secondary_text_color",
            )
        )
        self.button_shadow = button_shadow or getattr(self, "button_shadow", "none")
        self.button_shadow_active = button_shadow_active or getattr(
            self, "button_shadow_active", "none"
        )
        self.button_shadow_hover = button_shadow_hover or getattr(
            self, "button_shadow_hover", "none"
        )
        self.button_small_padding = button_small_padding or getattr(
            self, "button_small_padding", "*spacing_sm calc(2 * *spacing_sm)"
        )
        self.button_small_radius = button_small_radius or getattr(
            self, "button_small_radius", "*radius_lg"
        )
        self.button_small_text_size = button_small_text_size or getattr(
            self, "button_small_text_size", "*text_md"
        )
        self.button_small_text_weight = button_small_text_weight or getattr(
            self, "button_small_text_weight", "400"
        )
        self.button_transition = button_transition or getattr(
            self, "button_transition", "background-color 0.2s ease"
        )
        return self
