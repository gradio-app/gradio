from .base import Base
from .utils import colors, size 


class Monochrome(Base):
    def __init__(
        self,
        *,
        hue: colors.Color = colors.neutral,
        spacing_size: size.Size = size.spacing_md,
        radius_size: size.Size = size.radius_none,
        text_size: size.Size = size.text_md,
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
            # # Colors
            # input_background_base_dark="*neutral_800",
            slider_color="*neutral_900",
            color_text_body="*neutral_900",
            color_text_label="*color_text_body",
            color_text_subdued="*neutral_700",
            color_background_primary_dark="*neutral_700",

            button_primary_background_base="*neutral_900",
            button_primary_background_hover="*neutral_700",
            button_primary_text_color_base="white",
            button_secondary_background_base="*neutral_900",
            button_secondary_background_hover="*neutral_700",
            button_secondary_text_color_base="white",
            button_cancel_background_base="*neutral_900",
            button_cancel_background_hover="*neutral_700",
            button_cancel_text_color_base="white",
            checkbox_label_background_base="*neutral_900",
            checkbox_label_background_hover="*neutral_700",
            checkbox_color_text="white",
            checkbox_background_selected="*neutral_600",
            checkbox_border_color_selected="*neutral_600",

            # # Transition
            # button_transition = "none",
            # # Shadows
            # button_shadow="*shadow_drop",
            # button_shadow_hover="*shadow_drop_lg",
            # button_shadow_active="*shadow_inset",
            # input_shadow="0 0 0 *shadow_spread transparent, *shadow_inset",
            # checkbox_label_shadow="*shadow_drop",
            # block_shadow="*shadow_drop",
            # form_gap_width="1px",
            # # Button borders
            # input_border_width="1px",
            # input_background_base="white",
            # # Gradients
            # color_stat_background="linear-gradient(to right, *primary_400, *primary_200)",
            # color_stat_background_dark="linear-gradient(to right, *primary_400, *primary_600)",
            # color_functional_error_background=f"linear-gradient(to right, {colors.red.c100}, *color_background_secondary)",
            # color_functional_error_background_dark="*color_background_primary",
            # checkbox_label_background_base="linear-gradient(to top, *neutral_50, white)",
            # checkbox_label_background_base_dark="linear-gradient(to top, *neutral_700, *neutral_800)",
            # checkbox_label_background_hover="linear-gradient(to top, *neutral_100, white)",
            # checkbox_label_background_hover_dark="linear-gradient(to top, *neutral_700, *neutral_800)",
            # button_primary_background_base="linear-gradient(to bottom right, *primary_100, *primary_300)",
            # button_primary_background_base_dark="linear-gradient(to bottom right, *primary_600, *primary_700)",
            # button_primary_background_hover="linear-gradient(to bottom right, *primary_100, *primary_200)",
            # button_primary_background_hover_dark="linear-gradient(to bottom right, *primary_600, *primary_600)",
            # button_secondary_background_base="linear-gradient(to bottom right, *neutral_100, *neutral_200)",
            # button_secondary_background_base_dark="linear-gradient(to bottom right, *neutral_600, *neutral_700)",
            # button_secondary_background_hover="linear-gradient(to bottom right, *neutral_100, *neutral_100)",
            # button_secondary_background_hover_dark="linear-gradient(to bottom right, *neutral_600, *neutral_600)",
            # button_cancel_background_base=f"linear-gradient(to bottom right, {colors.red.c100}, {colors.red.c200})",
            # button_cancel_background_base_dark=f"linear-gradient(to bottom right, {colors.red.c600}, {colors.red.c700})",
            # button_cancel_background_hover=f"linear-gradient(to bottom right, {colors.red.c100}, {colors.red.c100})",
            # button_cancel_background_hover_dark=f"linear-gradient(to bottom right, {colors.red.c600}, {colors.red.c600})",
        )
