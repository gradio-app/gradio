from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes


class Headlines(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.zinc,
        secondary_hue: colors.Color | str = colors.zinc,
        neutral_hue: colors.Color | str = colors.zinc,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_none,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Lora"),
            "ui-serif",
            "system-ui",
            "serif",
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
        self.name = "headlines"
        super().set(
            # Colors
            slider_color="*neutral_900",
            slider_color_dark="*neutral_500",
            accordion_text_color="*body_text_color",
            accordion_text_color_dark="*body_text_color",
            table_text_color="*body_text_color",
            table_text_color_dark="*body_text_color",
            body_text_color="*neutral_900",
            body_text_color_dark="white",
            block_label_text_color="*body_text_color",
            block_title_text_color="*body_text_color",
            block_label_background_fill_dark="background_fill_primary_dark",
            block_label_border_width_dark="0px",
            body_text_color_subdued="*neutral_700",
            background_fill_primary_dark="*neutral_950",
            background_fill_secondary_dark="*neutral_800",
            block_background_fill_dark="background_fill_primary_dark",
            panel_background_fill_dark="background_fill_primary_dark",
            input_background_fill_dark="*neutral_900",
            # Button Colors
            button_primary_background_fill="*neutral_900",
            button_primary_background_fill_hover="*neutral_700",
            button_primary_text_color="white",
            button_primary_background_fill_dark="white",
            button_primary_background_fill_hover_dark="*neutral_100",
            button_primary_text_color_dark="*neutral_900",
            # Secondary button
            button_secondary_background_fill="button_primary_text_color",
            button_secondary_background_fill_dark="button_primary_text_color_dark",
            button_secondary_background_fill_hover="*neutral_100",
            button_secondary_background_fill_hover_dark="*neutral_900",
            button_secondary_text_color="*button_primary_background_fill",
            button_secondary_text_color_dark="button_primary_background_fill_dark",
            button_secondary_border_color="*neutral_500",
            button_secondary_border_color_dark="*neutral_600",
            button_secondary_border_color_hover="*neutral_600",
            button_secondary_border_color_hover_dark="*neutral_500",
            button_border_width="1px",
            button_border_width_dark="1px",
            # checkbox
            checkbox_label_text_color="*button_primary_background_fill",
            checkbox_label_background_fill="white",
            checkbox_label_background_fill_dark="*neutral_700",
            checkbox_label_background_fill_hover="*neutral_100",
            checkbox_border_color="*neutral_300",
            checkbox_border_color_dark="*neutral_600",
            checkbox_border_color_selected_dark="*neutral_300",
            checkbox_border_width="1px",
            checkbox_border_width_dark="1px",
            checkbox_background_color_dark="*neutral_700",
            checkbox_background_color_selected="*neutral_600",
            checkbox_background_color_selected_dark="*neutral_950",
            # Cancel Button
            button_cancel_background_fill=colors.red.c500,
            button_cancel_background_fill_dark=colors.red.c700,
            button_cancel_background_fill_hover=colors.red.c600,
            button_cancel_background_fill_hover_dark=colors.red.c800,
            button_cancel_border_color=colors.red.c500,
            button_cancel_border_color_dark=colors.red.c700,
            button_cancel_border_color_hover=colors.red.c500,
            button_cancel_border_color_hover_dark=colors.red.c600,
            button_cancel_text_color="white",
            button_cancel_text_color_dark="white",
            button_cancel_text_color_hover="white",
            button_cancel_text_color_hover_dark="white",
            # Padding
            checkbox_label_padding="*spacing_md",
            button_large_padding="*spacing_lg",
            button_small_padding="*spacing_sm",
            # Borders
            block_border_width="2px 0px 0px 0px",
            block_border_color="*neutral_900",
            block_border_color_dark="*neutral_500",
            block_border_width_dark="2px 0px 0px 0px",
            panel_border_width="2px 0px 0px 0px",
            panel_border_color="*neutral_900",
            block_shadow="none",
            block_shadow_dark="none",
            # Block Labels
            block_title_text_weight="600",
            block_label_text_weight="600",
            block_label_text_size="*text_md",
            # Stat
            stat_background_fill=colors.sky.c300,
            stat_background_fill_dark=colors.sky.c600,
        )
