from __future__ import annotations

from gradio.themes.base import Base
from gradio.themes.utils import colors, sizes


class Monochrome(Base):
    def __init__(
        self,
        *,
        hue: colors.Color | str = colors.neutral,
        spacing_size: sizes.Size | str = sizes.spacing_lg,
        radius_size: sizes.Size | str = sizes.radius_none,
        text_size: sizes.Size | str = sizes.text_md,
    ):
        super().__init__(
            primary_hue=hue,
            secondary_hue=hue,
            neutral_hue=hue,
            spacing_size=spacing_size,
            radius_size=radius_size,
            text_size=text_size,
        )
        super().set(
            # Colors
            slider_color="*neutral_900",
            slider_color_dark="*neutral_500",
            body_text_color="*neutral_900",
            block_label_color="*body_text_color",
            block_title_color="*body_text_color",
            text_color_subdued="*neutral_700",
            color_background_primary_dark="*neutral_900",
            color_background_secondary_dark="*neutral_800",
            block_background_dark="*neutral_800",
            input_background_dark="*neutral_600",
            # Button Colors
            button_primary_background="*neutral_900",
            button_primary_background_hover="*neutral_700",
            button_primary_text_color="white",
            button_primary_background_dark="*neutral_600",
            button_primary_background_hover_dark="*neutral_600",
            button_primary_text_color_dark="white",
            button_secondary_background="*button_primary_background",
            button_secondary_background_hover="*button_primary_background_hover",
            button_secondary_text_color="*button_primary_text_color",
            button_secondary_background_dark="*button_primary_background",
            button_secondary_background_hover_dark="*button_primary_background_hover",
            button_secondary_text_color_dark="*button_primary_text_color",
            button_cancel_background="*button_primary_background",
            button_cancel_background_hover="*button_primary_background_hover",
            button_cancel_text_color="*button_primary_text_color",
            button_cancel_background_dark="*button_primary_background",
            button_cancel_background_hover_dark="*button_primary_background_hover",
            button_cancel_text_color_dark="*button_primary_text_color",
            checkbox_label_background="*button_primary_background",
            checkbox_label_background_hover="*button_primary_background_hover",
            checkbox_text_color="*button_primary_text_color",
            checkbox_label_background_dark="*button_primary_background",
            checkbox_label_background_hover_dark="*button_primary_background_hover",
            checkbox_text_color_dark="*button_primary_text_color",
            checkbox_background_selected="*neutral_600",
            checkbox_background_dark="*neutral_700",
            checkbox_background_selected_dark="*neutral_700",
            checkbox_border_color_selected_dark="*neutral_800",
            # Padding
            checkbox_label_padding="*spacing_md",
            button_large_padding="*spacing_lg",
            button_small_padding="*spacing_sm",
            # Borders
            block_border_width="0px",
            block_border_width_dark="1px",
            shadow_drop_lg="0 1px 4px 0 rgb(0 0 0 / 0.1)",
            block_shadow="*shadow_drop_lg",
            block_shadow_dark="none",
            # Block Labels
            block_title_text_weight="600",
            block_label_text_weight="600",
            block_label_text_size="*text_md",
        )
