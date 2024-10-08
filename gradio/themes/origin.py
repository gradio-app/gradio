from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes


class Origin(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.orange,
        secondary_hue: colors.Color | str = colors.blue,
        neutral_hue: colors.Color | str = colors.gray,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_md,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Source Sans Pro"),
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
        self.name = "origin"
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
            button_transition="none",
            # Shadows
            button_primary_shadow="*shadow_drop",
            button_primary_shadow_hover="*shadow_drop_lg",
            button_primary_shadow_active="*shadow_inset",
            button_secondary_shadow="*shadow_drop",
            button_secondary_shadow_hover="*shadow_drop_lg",
            button_secondary_shadow_active="*shadow_inset",
            input_shadow="0 0 0 *shadow_spread transparent, *shadow_inset",
            input_shadow_focus="0 0 0 *shadow_spread *secondary_50, *shadow_inset",
            input_shadow_focus_dark="0 0 0 *shadow_spread *neutral_700, *shadow_inset",
            checkbox_label_shadow="*shadow_drop",
            block_shadow="*shadow_drop",
            form_gap_width="1px",
            # Button borders
            button_border_width="1px",
            button_border_width_dark="1px",
            input_border_width="1px",
            input_background_fill="white",
            # Gradients
            stat_background_fill="linear-gradient(to right, *primary_400, *primary_200)",
            stat_background_fill_dark="linear-gradient(to right, *primary_400, *primary_600)",
            checkbox_label_background_fill="linear-gradient(to top, *neutral_50, white)",
            checkbox_label_background_fill_dark="linear-gradient(to top, *neutral_900, *neutral_800)",
            checkbox_label_background_fill_hover="linear-gradient(to top, *neutral_100, white)",
            checkbox_label_background_fill_hover_dark="linear-gradient(to top, *neutral_900, *neutral_800)",
            # Primary Button
            button_primary_background_fill="linear-gradient(to bottom right, *primary_100, *primary_300)",
            button_primary_background_fill_dark="linear-gradient(to bottom right, *primary_500, *primary_600)",
            button_primary_background_fill_hover="linear-gradient(to bottom right, *primary_100, *primary_200)",
            button_primary_background_fill_hover_dark="linear-gradient(to bottom right, *primary_500, *primary_500)",
            button_primary_border_color="*primary_200",
            button_primary_border_color_dark="*primary_500",
            button_primary_border_color_hover="*button_primary_border_color",
            button_primary_border_color_hover_dark="*primary_500",
            button_primary_text_color="*primary_600",
            button_primary_text_color_dark="white",
            # Secondary Button
            button_secondary_background_fill="linear-gradient(to bottom right, *neutral_100, *neutral_200)",
            button_secondary_background_fill_dark="linear-gradient(to bottom right, *neutral_600, *neutral_700)",
            button_secondary_background_fill_hover="linear-gradient(to bottom right, *neutral_100, *neutral_100)",
            button_secondary_background_fill_hover_dark="linear-gradient(to bottom right, *neutral_600, *neutral_600)",
            button_secondary_border_color="*neutral_200",
            button_secondary_border_color_dark="*neutral_600",
            button_secondary_border_color_hover="*neutral_200",
            button_secondary_border_color_hover_dark="*neutral_600",
            button_secondary_text_color="*neutral_800",
            button_secondary_text_color_dark="white",
            # Cancel Button
            button_cancel_background_fill=f"linear-gradient(to bottom right, {colors.red.c100}, {colors.red.c200})",
            button_cancel_background_fill_dark=f"linear-gradient(to bottom right, {colors.red.c600}, {colors.red.c700})",
            button_cancel_background_fill_hover=f"linear-gradient(to bottom right, {colors.red.c100}, {colors.red.c100})",
            button_cancel_background_fill_hover_dark=f"linear-gradient(to bottom right, {colors.red.c600}, {colors.red.c600})",
            button_cancel_border_color=colors.red.c200,
            button_cancel_border_color_dark=colors.red.c600,
            button_cancel_border_color_hover=colors.red.c200,
            button_cancel_border_color_hover_dark=colors.red.c600,
            button_cancel_text_color=colors.red.c600,
            button_cancel_text_color_dark="white",
            # Other
            border_color_accent_subdued="*primary_200",
            button_transform_hover="none",
        )
