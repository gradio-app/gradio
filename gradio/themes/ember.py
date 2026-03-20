from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes


class Ember(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.orange,
        secondary_hue: colors.Color | str = colors.orange,
        neutral_hue: colors.Color | str = colors.stone,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_lg,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Source Sans 3"),
            "ui-sans-serif",
            "system-ui",
            "sans-serif",
        ),
        font_mono: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Source Code Pro"),
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
        self.name = "ember"
        super().set(
            # Body
            body_background_fill="*neutral_50",
            body_background_fill_dark="*neutral_950",
            body_text_color="*neutral_800",
            body_text_color_dark="*neutral_200",
            body_text_color_subdued="*neutral_500",
            body_text_color_subdued_dark="*neutral_400",
            # Backgrounds
            background_fill_primary="white",
            background_fill_primary_dark="*neutral_900",
            background_fill_secondary="*neutral_100",
            background_fill_secondary_dark="*neutral_800",
            # Shadows
            shadow_drop="0 1px 3px 0 rgb(0 0 0 / 0.08)",
            shadow_drop_lg="0 4px 12px 0 rgb(0 0 0 / 0.1)",
            shadow_spread="6px",
            # Blocks
            block_background_fill="white",
            block_background_fill_dark="*neutral_900",
            block_border_width="0px",
            block_shadow="*shadow_drop",
            block_shadow_dark="0 1px 4px 0 rgb(0 0 0 / 0.3)",
            block_label_background_fill="*primary_50",
            block_label_background_fill_dark="*primary_900",
            block_label_text_color="*primary_600",
            block_label_text_color_dark="*primary_300",
            block_label_text_weight="600",
            block_label_text_size="*text_md",
            block_label_padding="*spacing_sm *spacing_md",
            block_label_radius="*radius_md",
            block_title_background_fill="*primary_50",
            block_title_background_fill_dark="*primary_900",
            block_title_text_color="*primary_600",
            block_title_text_color_dark="*primary_300",
            block_title_text_weight="600",
            block_title_padding="*spacing_sm *spacing_md",
            block_title_radius="*radius_md",
            # Inputs
            input_background_fill="white",
            input_background_fill_dark="*neutral_800",
            input_border_color="*neutral_200",
            input_border_color_dark="*neutral_600",
            input_border_width="1px",
            input_shadow="none",
            input_shadow_focus="0 0 0 3px *primary_100",
            input_shadow_focus_dark="0 0 0 3px *primary_900",
            input_border_color_focus="*primary_400",
            input_border_color_focus_dark="*primary_500",
            # Buttons
            button_border_width="0px",
            button_transition="all 0.15s ease",
            button_primary_background_fill="*primary_500",
            button_primary_background_fill_dark="*primary_600",
            button_primary_background_fill_hover="*primary_600",
            button_primary_background_fill_hover_dark="*primary_500",
            button_primary_text_color="white",
            button_primary_shadow="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
            button_primary_shadow_hover="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            button_primary_shadow_active="none",
            button_secondary_background_fill="white",
            button_secondary_background_fill_dark="*neutral_800",
            button_secondary_background_fill_hover="*neutral_50",
            button_secondary_background_fill_hover_dark="*neutral_700",
            button_secondary_text_color="*neutral_700",
            button_secondary_text_color_dark="*neutral_200",
            button_secondary_border_color="*neutral_200",
            button_secondary_border_color_dark="*neutral_600",
            button_secondary_shadow="*shadow_drop",
            button_secondary_shadow_hover="*shadow_drop_lg",
            button_cancel_background_fill=colors.red.c500,
            button_cancel_background_fill_dark=colors.red.c600,
            button_cancel_background_fill_hover=colors.red.c600,
            button_cancel_background_fill_hover_dark=colors.red.c700,
            button_cancel_text_color="white",
            button_cancel_text_color_dark="white",
            # Checkboxes
            checkbox_background_color_selected="*primary_500",
            checkbox_background_color_selected_dark="*primary_500",
            checkbox_border_color="*neutral_300",
            checkbox_border_color_dark="*neutral_500",
            checkbox_border_color_selected="*primary_500",
            checkbox_border_color_selected_dark="*primary_500",
            checkbox_shadow="none",
            checkbox_label_background_fill="white",
            checkbox_label_background_fill_dark="*neutral_800",
            checkbox_label_background_fill_selected="*primary_500",
            checkbox_label_background_fill_selected_dark="*primary_600",
            checkbox_label_text_color_selected="white",
            checkbox_label_shadow="*shadow_drop",
            # Slider
            slider_color="*primary_500",
            slider_color_dark="*primary_400",
            # Color accents
            color_accent="*primary_500",
            color_accent_soft="*primary_50",
            color_accent_soft_dark="*primary_900",
            # Tables
            table_even_background_fill="*neutral_50",
            table_even_background_fill_dark="*neutral_800",
            table_odd_background_fill="white",
            table_odd_background_fill_dark="*neutral_900",
            # Panels
            panel_border_width="1px",
            panel_border_color="*neutral_200",
            panel_border_color_dark="*neutral_700",
            # Loader
            loader_color="*primary_500",
            loader_color_dark="*primary_400",
        )
