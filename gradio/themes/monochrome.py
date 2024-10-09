from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes


class Monochrome(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.neutral,
        secondary_hue: colors.Color | str = colors.neutral,
        neutral_hue: colors.Color | str = colors.neutral,
        spacing_size: sizes.Size | str = sizes.spacing_lg,
        radius_size: sizes.Size | str = sizes.radius_none,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Lora"),
            "ui-sans-serif",
            "system-ui",
            "sans-serif",
        ),
        font_mono: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.LocalFont("IBM Plex Mono"),
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
        self.name = "monochrome"
        super().set(
            # Colors
            slider_color="*neutral_900",
            slider_color_dark="*neutral_500",
            accordion_text_color="*body_text_color",
            accordion_text_color_dark="*body_text_color",
            table_text_color="*body_text_color",
            table_text_color_dark="*body_text_color",
            body_text_color="*neutral_900",
            block_label_text_color="*body_text_color",
            block_title_text_color="*body_text_color",
            body_text_color_subdued="*neutral_700",
            background_fill_primary_dark="*neutral_900",
            background_fill_secondary_dark="*neutral_800",
            block_background_fill_dark="*neutral_800",
            input_background_fill_dark="*neutral_700",
            # Buttons
            button_border_width="2px",
            button_primary_border_color="*neutral_900",
            button_primary_background_fill="*neutral_900",
            button_primary_background_fill_hover="*neutral_700",
            button_primary_text_color="white",
            button_primary_background_fill_dark="*neutral_600",
            button_primary_background_fill_hover_dark="*neutral_600",
            button_primary_text_color_dark="white",
            button_secondary_border_color="*neutral_900",
            button_secondary_background_fill="white",
            button_secondary_background_fill_hover="white",
            button_secondary_background_fill_dark="*neutral_700",
            button_secondary_border_color_hover="*neutral_400",
            button_secondary_text_color="*neutral_900",
            button_secondary_text_color_hover="*neutral_400",
            button_cancel_border_color="*neutral_900",
            button_cancel_background_fill="*button_secondary_background_fill",
            button_cancel_background_fill_hover="*button_secondary_background_fill_hover",
            button_cancel_text_color="*button_secondary_text_color",
            checkbox_label_border_color="*checkbox_background_color",
            checkbox_label_border_color_hover="*button_secondary_border_color_hover",
            checkbox_label_border_color_selected="*button_primary_border_color",
            checkbox_label_border_width="*button_border_width",
            checkbox_background_color="*input_background_fill",
            checkbox_label_background_fill_selected="*button_primary_background_fill",
            checkbox_label_text_color_selected="*button_primary_text_color",
            # Padding
            checkbox_label_padding="*spacing_sm",
            button_large_padding="*spacing_lg",
            button_small_padding="*spacing_sm",
            # Borders
            shadow_drop_lg="0 1px 4px 0 rgb(0 0 0 / 0.1)",
            block_shadow="none",
            block_shadow_dark="*shadow_drop_lg",
            # Block Labels
            block_title_text_weight="600",
            block_label_text_weight="600",
            block_label_text_size="*text_md",
        )
