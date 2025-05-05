from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes


class Ocean(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.emerald,
        secondary_hue: colors.Color | str = colors.sky,
        neutral_hue: colors.Color | str = colors.zinc,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_xxl,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("IBM Plex Sans"),
            "ui-sans-serif",
            "system-ui",
            "sans-serif",
        ),
        font_mono: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("IBM Plex Mono"),
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
        self.name = "ocean"
        super().set(
            button_border_width="0px",
            checkbox_label_border_width="1px",
            button_transform_hover="scale(1.02)",
            button_transition="all 0.1s ease-in-out",
            slider_color="*primary_400",
            button_primary_background_fill="linear-gradient(120deg, *secondary_500 0%, *primary_300 60%, *primary_400 100%)",
            button_primary_background_fill_hover="linear-gradient(120deg, *secondary_400 0%, *primary_300 60%, *primary_300 100%)",
            button_primary_text_color="*button_secondary_text_color",
            button_secondary_background_fill="linear-gradient(120deg, *neutral_300 0%, *neutral_100 60%, *neutral_200 100%)",
            button_secondary_background_fill_hover="linear-gradient(120deg, *neutral_200 0%, *neutral_100 60%, *neutral_100 100%)",
            checkbox_label_background_fill_selected="linear-gradient(120deg, *primary_400 0%, *primary_300 60%, *primary_400 100%)",
            checkbox_label_border_color_selected="*primary_400",
            checkbox_background_color_selected="*primary_400",
            checkbox_label_text_color_selected="*button_secondary_text_color",
            slider_color_dark="*primary_500",
            button_primary_background_fill_dark="linear-gradient(120deg, *secondary_600 0%, *primary_500 60%, *primary_600 100%)",
            button_primary_background_fill_hover_dark="linear-gradient(120deg, *secondary_500 0%, *primary_500 60%, *primary_500 100%)",
            button_primary_text_color_dark="*button_secondary_text_color",
            button_secondary_background_fill_dark="linear-gradient(120deg, *neutral_700 0%, *neutral_600 60%, *neutral_700 100%)",
            button_secondary_background_fill_hover_dark="linear-gradient(120deg, *neutral_600 0%, *neutral_600 60%, *neutral_700 100%)",
            checkbox_label_background_fill_selected_dark="linear-gradient(120deg, *primary_600 0%, *primary_500 60%, *primary_600 100%)",
            checkbox_label_border_color_selected_dark="*primary_600",
            checkbox_background_color_selected_dark="*primary_600",
            checkbox_label_text_color_selected_dark="*button_secondary_text_color",
            block_shadow="*shadow_drop_lg",
            button_secondary_shadow_hover="*shadow_drop_lg",
            button_primary_shadow_hover="0 1px 3px 0 *primary_200, 0 1px 2px -1px *primary_200",
            button_secondary_shadow_dark="none",
            button_primary_shadow_dark="none",
        )
