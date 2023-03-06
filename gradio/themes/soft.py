from __future__ import annotations

from gradio.themes.base import Base
from gradio.themes.utils import colors, sizes


class Soft(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.indigo,
        secondary_hue: colors.Color | str = colors.indigo,
        neutral_hue: colors.Color | str = colors.gray,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_md,
        text_size: sizes.Size | str = sizes.text_md,
    ):
        super().__init__(
            primary_hue=primary_hue,
            secondary_hue=secondary_hue,
            neutral_hue=neutral_hue,
            spacing_size=spacing_size,
            radius_size=radius_size,
            text_size=text_size,
        )
        super().set(
            # Colors
            color_background_primary="*neutral_50",
            slider_color="*primary_500",
            slider_color_dark="*primary_600",
            # Shadows
            shadow_drop="0 1px 4px 0 rgb(0 0 0 / 0.1)",
            shadow_drop_lg="0 2px 5px 0 rgb(0 0 0 / 0.1)",
            # Block Labels
            block_background="white",
            block_label_padding="*spacing_sm *spacing_md",
            block_label_background="*primary_100",
            block_label_background_dark="*primary_600",
            block_label_radius="*radius_md",
            block_label_text_size="*text_md",
            block_label_text_weight="600",
            block_label_color="*primary_500",
            block_label_color_dark="*white",
            block_title_radius="*block_label_radius",
            block_title_padding="*block_label_padding",
            block_title_background="*block_label_background",
            block_title_background_dark="*block_label_background",
            block_title_text_weight="600",
            block_title_color="*primary_500",
            block_title_color_dark="*white",
            block_label_margin="*spacing_md",
            # Inputs
            input_background="white",
            input_border_color="*neutral_50",
            input_shadow="*shadow_drop",
            input_shadow_focus="*shadow_drop_lg",
            checkbox_shadow="none",
            # Buttons
            shadow_spread="6px",
            button_shadow="*shadow_drop_lg",
            button_shadow_hover="*shadow_drop_lg",
            checkbox_label_shadow="*shadow_drop_lg",
            button_shadow_active="*shadow_inset",
            button_primary_background="*primary_500",
            button_primary_background_hover="*primary_400",
            button_primary_text_color="white",
            button_secondary_background="white",
            button_secondary_background_hover="*neutral_100",
            button_secondary_text_color="*neutral_800",
            button_cancel_background="*button_secondary_background",
            button_cancel_background_hover="*button_secondary_background_hover",
            button_cancel_text_color="*button_secondary_text_color",
            checkbox_label_background="white",
            checkbox_label_background_selected="*primary_500",
            checkbox_label_background_selected_dark="*primary_600",
            checkbox_border_width="1px",
            checkbox_border_color="*neutral_100",
            checkbox_border_color_dark="*neutral_600",
            checkbox_background_selected="*primary_600",
            checkbox_background_selected_dark="*primary_700",
            checkbox_border_color_focus="*primary_500",
            checkbox_border_color_focus_dark="*primary_600",
            checkbox_border_color_selected="*primary_600",
            checkbox_border_color_selected_dark="*primary_700",
            checkbox_text_color_selected="white",
            # Borders
            block_border_width="0px",
            block_border_width_dark="0px",
            panel_border_width="1px",
        )
