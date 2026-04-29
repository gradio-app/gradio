from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes

SKY_BLUE = "#6B8CFF"
BRICK_BROWN = "#C84C0C"
BRICK_DARK = "#A0380C"
QUESTION_GOLD = "#FAC000"
GROUND_TAN = "#E4A672"
GROUND_DARK = "#9C6838"
PIPE_GREEN = "#00A800"
PIPE_DARK = "#005800"
COIN_YELLOW = "#FCE4A8"
BLOCK_OUTLINE = "#000000"
WHITE = "#FCFCFC"

_BRICK_TILE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAoklEQVR42u3ZIQ6DQBAAwINUICsQCJ6AQFb0QX0Uz+EJCB6AqDhRWYGoa+rhUsjNujV7meyuuGwxPG7hzFGGkwfAv+Pym9zfTx0AyHoHXjHqAAAAAAAAAAAAAAAAAECWf+I56gBA3juw9p0OAGS3A90yfZNrXe/+wFg1IeX9wQgBHP4+0DZJ6xshAAAAAAAAAAAAAAAAgMPeB9q09Y0QwMb4AKePGE54eWq6AAAAAElFTkSuQmCC"

_COIN_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAiUlEQVR42mNkIAIsSGH4z0ACSJjDwEhIDRPDAIEBs5iFmOCNrwkgaNDvBxuQuf8JBfvIC2pGUoMXLUixgnNnEOwbN7Cn9hEY1KQG77Il2A2KisEe1MgAOdhHCxCSUu+Q9PGoxaMWj1pM+2oRuewlBhBTPo/wapGYxp6GBmmG4gre0VQ92oWhCwAAkfwxfq/Sj9YAAAAASUVORK5CYII="

_SKY_TILE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAEACAIAAABK8lkwAAAD0UlEQVR42u3dTY6CQBRG0Y+GZboDB+g+SNA9uE2Cox61xibd/BScMzSManLzqoSqzt0YAI7nyxIACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAQJI0loBS3C/Dy9/bW21xwAQAgAAAIAAA/FSdu9EqkNL2/d9xHgAmAAAEAAABACDOAMhe9v3jPABMAAAIAAACAIAAACAAAAIAgAAAEO8BZMP/Aff/7uO4nqY93z+sGZgAABAAAAQAgKx8BvBf33uJswEAEwAAAgCAAACQtc8A5tj3j/MAABMAAAIAgAAAkDXOAJbc949zAgATAAACAIAAAPCtsQTAlrkjxAQAgAAAIAAApIhvAU2933UO7oyFFLvXH+/6mAAAEAAABACAlHAnMIA7QkwAAAgAAAIAQJwBALHvH+cEJgAABAAAAQBAAAAQAAAEAAABAMB7AMCK3BFiAgBAAAAQAABm1VgCIPbfTQAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAALK2xBPtzvwwfn2lvtYUCEwAAAgCAAACwb9W5G61CjrHvH+cBgAkAAAEAEAAABAAAAQBAAAAQAADiPQC25nr6/Ez/sE5gAgBAAAAQAADiPgAKY38fMAEAIAAACAAAAgAgAAAIAAACAIAAACAAAAgAAAIAQHwLCFjE/TK8/L291RYHEwAAAgCAAADgTmDIPvb933EegAkAAAEAQAAA4gwAyF72/eM8ABMAAAIAgAAAIAAAAgCAAAAgAADEewDAFlxP057vH9YMEwAAAgCAAADEncBAAezpYwIAQAAAEAAAUtAZwG++de475gAmAAAEAAABACBFfAvoL3ecOg8AMAEAIAAACAAAAgCAAAAgAAAIAEC8B5At33HqG+gAJgAABAAAAQAgxd0HYH8fwAQAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAwOKeP55sGdNyCWcAAAAASUVORK5CYII="

_MARIO_CSS = f"""
.gradio-container {{
    background: url("{_SKY_TILE}") repeat !important;
}}

.label-wrap {{
    background: url("{_BRICK_TILE}") repeat !important;
    border: 4px solid {BLOCK_OUTLINE} !important;
    box-shadow: 0px 4px 0px 0px {BRICK_DARK} !important;
    color: {WHITE} !important;
    border-radius: 4px !important;
}}

button.secondary {{
    background: url("{_BRICK_TILE}") repeat !important;
}}

input[type="range"]::-webkit-slider-thumb {{
    -webkit-appearance: none !important;
    appearance: none !important;
    width: 30px !important;
    height: 30px !important;
    background: url("{_COIN_IMG}") no-repeat center / contain !important;
    background-color: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    cursor: pointer !important;
    margin-top: -12px !important;
}}
input[type="range"]::-moz-range-thumb {{
    appearance: none !important;
    width: 30px !important;
    height: 30px !important;
    background: url("{_COIN_IMG}") no-repeat center / contain !important;
    background-color: transparent !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    cursor: pointer !important;
}}

.reset-button,
.icon,
[class*="icon"] {{
    font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif !important;
    font-size: 18px !important;
}}

"""


class Mario(Base):
    def __init__(
        self,
        *,
        primary_hue: colors.Color | str = colors.orange,
        secondary_hue: colors.Color | str = colors.green,
        neutral_hue: colors.Color | str = colors.stone,
        spacing_size: sizes.Size | str = sizes.spacing_md,
        radius_size: sizes.Size | str = sizes.radius_sm,
        text_size: sizes.Size | str = sizes.text_md,
        font: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Press Start 2P"),
            "ui-monospace",
            "monospace",
        ),
        font_mono: fonts.Font | str | Iterable[fonts.Font | str] = (
            fonts.GoogleFont("Press Start 2P"),
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
        self.name = "mario"
        self.custom_css = _MARIO_CSS
        super().set(
            body_background_fill=SKY_BLUE,
            body_text_color=BLOCK_OUTLINE,
            body_text_color_subdued=BRICK_DARK,
            body_text_weight="400",
            background_fill_primary=SKY_BLUE,
            background_fill_secondary=GROUND_TAN,
            shadow_drop="none",
            shadow_drop_lg="none",
            shadow_spread="0px",
            shadow_inset="rgba(0,0,0,0.3) 0px 2px 4px 0px inset",
            block_background_fill=QUESTION_GOLD,
            block_border_width="4px",
            block_border_color=BLOCK_OUTLINE,
            block_shadow=f"0px 4px 0px 0px {BRICK_DARK}",
            block_radius="4px",
            block_padding="*spacing_lg",
            block_label_background_fill=BRICK_BROWN,
            block_label_text_color=BLOCK_OUTLINE,
            block_label_text_weight="400",
            block_label_text_size="*text_sm",
            block_label_padding="*spacing_sm *spacing_md",
            block_label_radius="4px",
            block_label_border_color=BLOCK_OUTLINE,
            block_label_border_width="3px",
            block_label_shadow=f"0px 3px 0px 0px {GROUND_DARK}",
            block_title_background_fill=BRICK_BROWN,
            block_title_text_color=BLOCK_OUTLINE,
            block_title_text_weight="400",
            block_title_padding="*spacing_sm *spacing_md",
            block_title_radius="4px",
            block_title_border_color=BLOCK_OUTLINE,
            block_title_border_width="3px",
            input_background_fill=COIN_YELLOW,
            input_border_color=BLOCK_OUTLINE,
            input_border_width="3px",
            input_shadow="none",
            input_shadow_focus=f"0 0 0 3px {QUESTION_GOLD}",
            input_border_color_focus=BRICK_BROWN,
            input_background_fill_focus=WHITE,
            input_radius="4px",
            input_placeholder_color=GROUND_DARK,
            button_border_width="4px",
            button_transform_hover="translateY(-2px)",
            button_transform_active="translateY(2px)",
            button_transition="all 0.08s ease",
            button_primary_background_fill=PIPE_GREEN,
            button_primary_background_fill_hover="#10C010",
            button_primary_text_color=BLOCK_OUTLINE,
            button_primary_border_color=BLOCK_OUTLINE,
            button_primary_shadow=f"0px 4px 0px 0px {PIPE_DARK}",
            button_primary_shadow_hover=f"0px 6px 0px 0px {PIPE_DARK}",
            button_primary_shadow_active=f"0px 1px 0px 0px {PIPE_DARK}",
            button_secondary_background_fill=BRICK_BROWN,
            button_secondary_background_fill_hover="#D86020",
            button_secondary_text_color=BLOCK_OUTLINE,
            button_secondary_border_color=BLOCK_OUTLINE,
            button_secondary_shadow=f"0px 4px 0px 0px {GROUND_DARK}",
            button_secondary_shadow_hover=f"0px 6px 0px 0px {GROUND_DARK}",
            button_secondary_shadow_active=f"0px 1px 0px 0px {GROUND_DARK}",
            button_cancel_background_fill=colors.red.c600,
            button_cancel_background_fill_hover=colors.red.c500,
            button_cancel_text_color=BLOCK_OUTLINE,
            button_cancel_border_color=BLOCK_OUTLINE,
            button_cancel_shadow=f"0px 4px 0px 0px {colors.red.c900}",
            button_cancel_shadow_hover=f"0px 6px 0px 0px {colors.red.c900}",
            button_cancel_shadow_active=f"0px 1px 0px 0px {colors.red.c900}",
            checkbox_background_color_selected=QUESTION_GOLD,
            checkbox_border_color=BLOCK_OUTLINE,
            checkbox_border_color_selected=BLOCK_OUTLINE,
            checkbox_border_width="3px",
            checkbox_shadow="none",
            checkbox_label_background_fill=COIN_YELLOW,
            checkbox_label_background_fill_hover=WHITE,
            checkbox_label_background_fill_selected=QUESTION_GOLD,
            checkbox_label_text_color=BLOCK_OUTLINE,
            checkbox_label_text_color_selected=BLOCK_OUTLINE,
            checkbox_label_border_width="3px",
            checkbox_label_border_color=BLOCK_OUTLINE,
            checkbox_label_border_color_selected=BLOCK_OUTLINE,
            checkbox_label_shadow=f"0px 3px 0px 0px {GROUND_DARK}",
            checkbox_label_shadow_hover=f"0px 5px 0px 0px {GROUND_DARK}",
            checkbox_label_shadow_active=f"0px 1px 0px 0px {GROUND_DARK}",
            slider_color=PIPE_GREEN,
            color_accent=QUESTION_GOLD,
            color_accent_soft=COIN_YELLOW,
            table_even_background_fill=COIN_YELLOW,
            table_odd_background_fill=GROUND_TAN,
            table_border_color=BLOCK_OUTLINE,
            table_row_focus=QUESTION_GOLD,
            panel_border_width="4px",
            panel_border_color=BLOCK_OUTLINE,
            panel_background_fill=BRICK_BROWN,
            loader_color=QUESTION_GOLD,
            error_background_fill="#FCD0D0",
            error_border_color=colors.red.c600,
            error_text_color=colors.red.c800,
            error_icon_color=colors.red.c600,
            link_text_color=PIPE_GREEN,
            link_text_color_hover="#10C010",
        )

    @staticmethod
    def css() -> str:
        """Return the theme's CSS.

        This CSS is automatically applied when using the Mario theme.
        This method is provided for reference or if you want to extract the CSS separately.
        """
        return _MARIO_CSS
