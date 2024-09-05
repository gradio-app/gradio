from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes


class Default(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.orange,
        secondary_hue: colors.Color | str = colors.blue,
        neutral_hue: colors.Color | str = colors.zinc,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_md,
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
        self.name = "default"
        super().set(
            # Colors
            input_background_fill_dark="*neutral_800",
            error_background_fill=colors.red.c50,
            error_background_fill_dark="*neutral_900",
            error_border_color=colors.red.c700,
            error_border_color_dark=colors.red.c500,
            error_icon_color=colors.red.c700,
            error_icon_color_dark=colors.red.c500,
            # Transition
            button_transition="background-color 0.2s ease",
            # Shadows
            button_shadow="none",
            button_shadow_hover="none",
            button_shadow_active="none",
            input_shadow=None,
            input_shadow_focus="0 0 0 *shadow_spread *secondary_50, *shadow_inset",
            input_shadow_focus_dark="0 0 0 *shadow_spread *neutral_700, *shadow_inset",
            checkbox_label_shadow=None,
            block_shadow=None,
            form_gap_width="0px",
            # Button borders
            input_border_width="1px",
            input_background_fill="white",
            # Gradients
            stat_background_fill="linear-gradient(to right, *primary_400, *primary_200)",
            stat_background_fill_dark="linear-gradient(to right, *primary_400, *primary_600)",
            checkbox_label_background_fill="*background_fill_primary",
            checkbox_label_background_fill_dark="*background_fill_primary",
            checkbox_label_background_fill_hover="*background_fill_secondary",
            checkbox_label_background_fill_hover_dark="*background_fill_secondary",
            # Primary Button
            button_primary_background_fill="*primary_500",
            button_primary_background_fill_dark="*primary_600",
            button_primary_background_fill_hover="*primary_600",
            button_primary_background_fill_hover_dark="*primary_700",
            button_primary_border_color="*primary_500",
            button_primary_border_color_dark="*primary_600",
            button_primary_border_color_hover="*primary_500",
            button_primary_border_color_hover_dark="*primary_500",
            button_primary_text_color="white",
            button_primary_text_color_dark="white",
            # Secondary Button
            button_secondary_background_fill="*neutral_200",
            button_secondary_background_fill_dark="*neutral_600",
            button_secondary_background_fill_hover="*neutral_300",
            button_secondary_background_fill_hover_dark="*neutral_700",
            button_secondary_border_color="*neutral_200",
            button_secondary_border_color_dark="*neutral_600",
            button_secondary_border_color_hover="*neutral_200",
            button_secondary_border_color_hover_dark="*neutral_500",
            button_secondary_text_color="black",
            button_secondary_text_color_dark="white",
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
            # Other
            border_color_accent_subdued="*primary_200",
        )
