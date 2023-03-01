from .base import Base
from .utils import colors, size


class Default(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color = colors.orange,
        secondary_hue: colors.Color = colors.blue,
        neutral_hue: colors.Color = colors.gray,
        spacing_size: size.Size = size.spacing_md,
        radius_size: size.Size = size.radius_md,
        text_size: size.Size = size.text_md,
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
            input_background_dark="*neutral_800",
            # Transition
            button_transition="none",
            # Shadows
            button_shadow="*shadow_drop",
            button_shadow_hover="*shadow_drop_lg",
            button_shadow_active="*shadow_inset",
            input_shadow="0 0 0 *shadow_spread transparent, *shadow_inset",
            input_shadow_focus="0 0 0 *shadow_spread *secondary_50, *shadow_inset",
            input_shadow_focus_dark="0 0 0 *shadow_spread *neutral_700, *shadow_inset",
            checkbox_label_shadow="*shadow_drop",
            block_shadow="*shadow_drop",
            form_gap_width="1px",
            # Button borders
            input_border_width="1px",
            input_background="white",
            # Gradients
            stat_color_background="linear-gradient(to right, *primary_400, *primary_200)",
            stat_color_background_dark="linear-gradient(to right, *primary_400, *primary_600)",
            functional_error_background_color=f"linear-gradient(to right, {colors.red.c100}, *color_background_secondary)",
            functional_error_background_dark_color="*color_background_primary",
            checkbox_label_background="linear-gradient(to top, *neutral_50, white)",
            checkbox_label_background_dark="linear-gradient(to top, *neutral_900, *neutral_800)",
            checkbox_label_background_hover="linear-gradient(to top, *neutral_100, white)",
            checkbox_label_background_hover_dark="linear-gradient(to top, *neutral_900, *neutral_800)",
            button_primary_background="linear-gradient(to bottom right, *primary_100, *primary_300)",
            button_primary_background_dark="linear-gradient(to bottom right, *primary_600, *primary_700)",
            button_primary_background_hover="linear-gradient(to bottom right, *primary_100, *primary_200)",
            button_primary_background_hover_dark="linear-gradient(to bottom right, *primary_600, *primary_600)",
            button_secondary_background="linear-gradient(to bottom right, *neutral_100, *neutral_200)",
            button_secondary_background_dark="linear-gradient(to bottom right, *neutral_600, *neutral_700)",
            button_secondary_background_hover="linear-gradient(to bottom right, *neutral_100, *neutral_100)",
            button_secondary_background_hover_dark="linear-gradient(to bottom right, *neutral_600, *neutral_600)",
            button_cancel_background=f"linear-gradient(to bottom right, {colors.red.c100}, {colors.red.c200})",
            button_cancel_background_dark=f"linear-gradient(to bottom right, {colors.red.c600}, {colors.red.c700})",
            button_cancel_background_hover=f"linear-gradient(to bottom right, {colors.red.c100}, {colors.red.c100})",
            button_cancel_background_hover_dark=f"linear-gradient(to bottom right, {colors.red.c600}, {colors.red.c600})",
        )
