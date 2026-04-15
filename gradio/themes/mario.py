from __future__ import annotations

from collections.abc import Iterable

from gradio.themes.base import Base
from gradio.themes.utils import colors, fonts, sizes
from gradio.themes.utils.sizes import Size

SKY_BLUE = "#6B8CFF"
SKY_BLUE_DARK = "#1A1A40"
BRICK_BROWN = "#C84C0C"
BRICK_DARK = "#A0380C"
MORTAR = "#9C6838"
MORTAR_DARK = "#5A3A1A"
QUESTION_GOLD = "#FAC000"
QUESTION_DARK = "#C89800"
GROUND_TAN = "#E4A672"
GROUND_DARK = "#9C6838"
PIPE_GREEN = "#00A800"
PIPE_DARK = "#005800"
COIN_YELLOW = "#FCE4A8"
BLOCK_OUTLINE = "#000000"
BLOCK_OUTLINE_DARK = "#3A2A1A"
WHITE = "#FCFCFC"
DARK_BG = "#1C0E04"
DARK_SURFACE = "#2C1A0A"
DARK_PANEL = "#3C2614"

_BRICK_TILE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAoklEQVR42u3ZIQ6DQBAAwINUICsQCJ6AQFb0QX0Uz+EJCB6AqDhRWYGoa+rhUsjNujV7meyuuGwxPG7hzFGGkwfAv+Pym9zfTx0AyHoHXjHqAAAAAAAAAAAAAAAAAECWf+I56gBA3juw9p0OAGS3A90yfZNrXe/+wFg1IeX9wQgBHP4+0DZJ6xshAAAAAAAAAAAAAAAAgMPeB9q09Y0QwMb4AKePGE54eWq6AAAAAElFTkSuQmCC"
_DARK_BRICK_TILE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAm0lEQVR42u3ZsQqDMBAAUCsOoUgGcehXOPQj/Gg/x9nBQcRJ3Ep3G6rk3XZLwuPuhuQeffcq7hxlcfMA+HdU30n/3FQAIOsZmBYzAAAAAAAAAAAAAAAAAJDnm3hcdhUAyPtfKDYqAJDdDLz3+ZO0dfj5BcMaku4ftBDA5fcDZUh6vhYCAAAAAAAAAAAAAAAAuOx+IKY9XwsBnIwDEJAZ0vSz8U4AAAAASUVORK5CYII="

_COIN_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAiUlEQVR42mNkIAIsSGH4z0ACSJjDwEhIDRPDAIEBs5iFmOCNrwkgaNDvBxuQuf8JBfvIC2pGUoMXLUixgnNnEOwbN7Cn9hEY1KQG77Il2A2KisEe1MgAOdhHCxCSUu+Q9PGoxaMWj1pM+2oRuewlBhBTPo/wapGYxp6GBmmG4gre0VQ92oWhCwAAkfwxfq/Sj9YAAAAASUVORK5CYII="

_SKY_TILE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAEACAIAAABK8lkwAAAD0UlEQVR42u3dTY6CQBRG0Y+GZboDB+g+SNA9uE2Cox61xibd/BScMzSManLzqoSqzt0YAI7nyxIACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAQJI0loBS3C/Dy9/bW21xwAQAgAAAIAAA/FSdu9EqkNL2/d9xHgAmAAAEAAABACDOAMhe9v3jPABMAAAIAAACAIAAACAAAAIAgAAAEO8BZMP/Aff/7uO4nqY93z+sGZgAABAAAAQAgKx8BvBf33uJswEAEwAAAgCAAACQtc8A5tj3j/MAABMAAAIAgAAAkDXOAJbc949zAgATAAACAIAAAPCtsQTAlrkjxAQAgAAAIAAApIhvAU2933UO7oyFFLvXH+/6mAAAEAAABACAlHAnMIA7QkwAAAgAAAIAQJwBALHvH+cEJgAABAAAAQBAAAAQAAAEAAABAMB7AMCK3BFiAgBAAAAQAABm1VgCIPbfTQAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAALK2xBPtzvwwfn2lvtYUCEwAAAgCAAACwb9W5G61CjrHvH+cBgAkAAAEAEAAABAAAAQBAAAAQAADiPQC25nr6/Ez/sE5gAgBAAAAQAADiPgAKY38fMAEAIAAACAAAAgAgAAAIAAACAIAAACAAAAgAAAIAQHwLCFjE/TK8/L291RYHEwAAAgCAAADgTmDIPvb933EegAkAAAEAQAAA4gwAyF72/eM8ABMAAAIAgAAAIAAAAgCAAAAgAADEewDAFlxP057vH9YMEwAAAgCAAADEncBAAezpYwIAQAAAEAAAUtAZwG++de475gAmAAAEAAABACBFfAvoL3ecOg8AMAEAIAAACAAAAgCAAAAgAAAIAEC8B5At33HqG+gAJgAABAAAAQAgxd0HYH8fwAQAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAwOKeP55sGdNyCWcAAAAASUVORK5CYII="
_DARK_SKY_TILE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAEACAIAAABK8lkwAAAD30lEQVR42u3dMW6rQBSG0T+RC5Ali9qryf5XgywhKNO6CCLICXDxOeUTaeYVn+6MYT7u968A8H4+LQGAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAAJMnFElDFbet+/PdH31scMAEAIAAACAAAcQZATrHvP/eM8wAwAQAgAAAIAABxBkAq7/s7DwATAAACAIAAACAAAAgAAAIAgAAAxHsAqfIbcL/vPrfn/9/22qz623GYLCCYAAAQAAAEAIDsewbwV997ibOBU7OnDyYAAAQAAAEAICXOAF7Z9/cteAATAAACAIAAAJBDnQH8976/bwoBmAAAEAAABACAlLgPACDO80wAAAgAAAIAQCqcAbxyv2t8Xx5ir98dISYAAAQAAAEAIAXeA7D/DsQdISYAAAQAAAEAIL4FBMS+v28KmQAAEAAABAAAAQBAAAAQAAAEAIB4DwDYjztCTAAACAAAAgBAnAEAp+eOEBMAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAJgCQAEAAABAEAAABAAAAQAAAEAQAAAEAAABAAAAQBAAAAQAAAEAAABAEAAABAAAAQAAAEAQAAAEAAABAAAAQBAAADe2MUSnM+t6xafefS9hQITAAACAIAAABBnAOQU+/5zzzsPABMAAAIAgAAAIAAACAAAAgCAAAAQ7wGwqeff8rfXZvH5cZgsGpgAABAAAAQAgDgDoBb7+4AJAAABAEAAABAAAAEAQAAAEAAABAAAAQBAAAAQAADiW0DAJm5dl6X7IcAEAIAAACAAAHEGAKTyvv/cM84DMAEAIAAACABAnAEAqbzv7zwAEwAAAgCAAAAgAAAIAIAAACAAAMR7AMAhPP9+v702q/52HCYLiAkAAAEAEABLABBnAMDx2dPHBACAAAAgAACk0BnAb7517jvmACYAAAQAAAEAICXOANbecepeUwATAAACAIAAACAAAAgAAAIAgAAAsN97AGvvOPUNdAATAAACAIAAAJBy9wHY3wcwAQAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACACAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACACAAAAgAAAIAAACAIAAACAAAAgAAAIAgAAAIAAACAAAAgCAAACwuW8pVm8Uz2mD/gAAAABJRU5ErkJggg=="

_MARIO_CSS = f"""
.gradio-container {{
    background: url("{_SKY_TILE}") repeat !important;
}}
.dark .gradio-container {{
    background: url("{_DARK_SKY_TILE}") repeat !important;
}}

.label-wrap {{
    background: url("{_BRICK_TILE}") repeat !important;
    border: 4px solid {BLOCK_OUTLINE} !important;
    box-shadow: 0px 4px 0px 0px {BRICK_DARK} !important;
    color: {WHITE} !important;
    border-radius: 4px !important;
}}
.dark .label-wrap {{
    background: url("{_DARK_BRICK_TILE}") repeat !important;
    border-color: {BLOCK_OUTLINE_DARK} !important;
    box-shadow: 0px 4px 0px 0px {BLOCK_OUTLINE} !important;
    color: {COIN_YELLOW} !important;
}}

button.secondary {{
    background: url("{_BRICK_TILE}") repeat !important;
}}
.dark button.secondary {{
    background: url("{_DARK_BRICK_TILE}") repeat !important;
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
        self._mario_css = _MARIO_CSS
        super().set(
            body_background_fill=SKY_BLUE,
            body_background_fill_dark=SKY_BLUE_DARK,
            body_text_color=BLOCK_OUTLINE,
            body_text_color_dark=COIN_YELLOW,
            body_text_color_subdued=BRICK_DARK,
            body_text_color_subdued_dark=GROUND_TAN,
            body_text_weight="400",
            background_fill_primary=SKY_BLUE,
            background_fill_primary_dark=DARK_BG,
            background_fill_secondary=GROUND_TAN,
            background_fill_secondary_dark=DARK_SURFACE,
            shadow_drop="none",
            shadow_drop_lg="none",
            shadow_spread="0px",
            shadow_inset=f"rgba(0,0,0,0.3) 0px 2px 4px 0px inset",
            block_background_fill=QUESTION_GOLD,
            block_background_fill_dark=QUESTION_DARK,
            block_border_width="4px",
            block_border_color=BLOCK_OUTLINE,
            block_border_color_dark=BLOCK_OUTLINE_DARK,
            block_shadow=f"0px 4px 0px 0px {BRICK_DARK}",
            block_shadow_dark=f"0px 4px 0px 0px {BLOCK_OUTLINE}",
            block_radius="4px",
            block_padding="*spacing_lg",
            block_label_background_fill=BRICK_BROWN,
            block_label_background_fill_dark=BRICK_DARK,
            block_label_text_color=WHITE,
            block_label_text_color_dark=COIN_YELLOW,
            block_label_text_weight="400",
            block_label_text_size="*text_sm",
            block_label_padding="*spacing_sm *spacing_md",
            block_label_radius="4px",
            block_label_border_color=BLOCK_OUTLINE,
            block_label_border_color_dark=BLOCK_OUTLINE_DARK,
            block_label_border_width="3px",
            block_label_shadow=f"0px 3px 0px 0px {GROUND_DARK}",
            block_title_background_fill=BRICK_BROWN,
            block_title_background_fill_dark=BRICK_DARK,
            block_title_text_color=WHITE,
            block_title_text_color_dark=COIN_YELLOW,
            block_title_text_weight="400",
            block_title_padding="*spacing_sm *spacing_md",
            block_title_radius="4px",
            block_title_border_color=BLOCK_OUTLINE,
            block_title_border_color_dark=BLOCK_OUTLINE_DARK,
            block_title_border_width="3px",
            input_background_fill=COIN_YELLOW,
            input_background_fill_dark=DARK_SURFACE,
            input_border_color=BLOCK_OUTLINE,
            input_border_color_dark=BLOCK_OUTLINE_DARK,
            input_border_width="3px",
            input_shadow="none",
            input_shadow_focus=f"0 0 0 3px {QUESTION_GOLD}",
            input_shadow_focus_dark=f"0 0 0 3px {QUESTION_DARK}",
            input_border_color_focus=BRICK_BROWN,
            input_border_color_focus_dark=QUESTION_GOLD,
            input_background_fill_focus=WHITE,
            input_background_fill_focus_dark=DARK_PANEL,
            input_radius="4px",
            input_placeholder_color=GROUND_DARK,
            input_placeholder_color_dark=GROUND_TAN,
            button_border_width="4px",
            button_transform_hover="translateY(-2px)",
            button_transform_active="translateY(2px)",
            button_transition="all 0.08s ease",
            button_primary_background_fill=PIPE_GREEN,
            button_primary_background_fill_dark=PIPE_GREEN,
            button_primary_background_fill_hover="#10C010",
            button_primary_background_fill_hover_dark="#10C010",
            button_primary_text_color=WHITE,
            button_primary_text_color_dark=WHITE,
            button_primary_border_color=BLOCK_OUTLINE,
            button_primary_border_color_dark=BLOCK_OUTLINE_DARK,
            button_primary_shadow=f"0px 4px 0px 0px {PIPE_DARK}",
            button_primary_shadow_hover=f"0px 6px 0px 0px {PIPE_DARK}",
            button_primary_shadow_active=f"0px 1px 0px 0px {PIPE_DARK}",
            button_primary_shadow_dark=f"0px 4px 0px 0px {PIPE_DARK}",
            button_primary_shadow_hover_dark=f"0px 6px 0px 0px {PIPE_DARK}",
            button_primary_shadow_active_dark=f"0px 1px 0px 0px {PIPE_DARK}",
            button_secondary_background_fill=BRICK_BROWN,
            button_secondary_background_fill_dark=BRICK_DARK,
            button_secondary_background_fill_hover="#D86020",
            button_secondary_background_fill_hover_dark=BRICK_BROWN,
            button_secondary_text_color=WHITE,
            button_secondary_text_color_dark=COIN_YELLOW,
            button_secondary_border_color=BLOCK_OUTLINE,
            button_secondary_border_color_dark=BLOCK_OUTLINE_DARK,
            button_secondary_shadow=f"0px 4px 0px 0px {GROUND_DARK}",
            button_secondary_shadow_hover=f"0px 6px 0px 0px {GROUND_DARK}",
            button_secondary_shadow_active=f"0px 1px 0px 0px {GROUND_DARK}",
            button_secondary_shadow_dark=f"0px 4px 0px 0px {BLOCK_OUTLINE}",
            button_secondary_shadow_hover_dark=f"0px 6px 0px 0px {BLOCK_OUTLINE}",
            button_secondary_shadow_active_dark=f"0px 1px 0px 0px {BLOCK_OUTLINE}",
            button_cancel_background_fill=colors.red.c600,
            button_cancel_background_fill_dark=colors.red.c700,
            button_cancel_background_fill_hover=colors.red.c500,
            button_cancel_background_fill_hover_dark=colors.red.c600,
            button_cancel_text_color=WHITE,
            button_cancel_text_color_dark=WHITE,
            button_cancel_border_color=BLOCK_OUTLINE,
            button_cancel_border_color_dark=BLOCK_OUTLINE_DARK,
            button_cancel_shadow=f"0px 4px 0px 0px {colors.red.c900}",
            button_cancel_shadow_hover=f"0px 6px 0px 0px {colors.red.c900}",
            button_cancel_shadow_active=f"0px 1px 0px 0px {colors.red.c900}",
            button_cancel_shadow_dark=f"0px 4px 0px 0px {colors.red.c950}",
            button_cancel_shadow_hover_dark=f"0px 6px 0px 0px {colors.red.c950}",
            button_cancel_shadow_active_dark=f"0px 1px 0px 0px {colors.red.c950}",
            checkbox_background_color_selected=QUESTION_GOLD,
            checkbox_background_color_selected_dark=QUESTION_DARK,
            checkbox_border_color=BLOCK_OUTLINE,
            checkbox_border_color_dark=BLOCK_OUTLINE_DARK,
            checkbox_border_color_selected=BLOCK_OUTLINE,
            checkbox_border_color_selected_dark=BLOCK_OUTLINE_DARK,
            checkbox_border_width="3px",
            checkbox_shadow="none",
            checkbox_label_background_fill=COIN_YELLOW,
            checkbox_label_background_fill_dark=DARK_SURFACE,
            checkbox_label_background_fill_hover=WHITE,
            checkbox_label_background_fill_hover_dark=DARK_PANEL,
            checkbox_label_background_fill_selected=QUESTION_GOLD,
            checkbox_label_background_fill_selected_dark=QUESTION_DARK,
            checkbox_label_text_color_selected=BLOCK_OUTLINE,
            checkbox_label_text_color_selected_dark=WHITE,
            checkbox_label_border_width="3px",
            checkbox_label_border_color=BLOCK_OUTLINE,
            checkbox_label_border_color_dark=BLOCK_OUTLINE_DARK,
            checkbox_label_border_color_selected=BLOCK_OUTLINE,
            checkbox_label_border_color_selected_dark=BLOCK_OUTLINE_DARK,
            checkbox_label_shadow=f"0px 3px 0px 0px {GROUND_DARK}",
            checkbox_label_shadow_hover=f"0px 5px 0px 0px {GROUND_DARK}",
            checkbox_label_shadow_active=f"0px 1px 0px 0px {GROUND_DARK}",
            checkbox_label_shadow_dark=f"0px 3px 0px 0px {BLOCK_OUTLINE}",
            checkbox_label_shadow_hover_dark=f"0px 5px 0px 0px {BLOCK_OUTLINE}",
            checkbox_label_shadow_active_dark=f"0px 1px 0px 0px {BLOCK_OUTLINE}",
            slider_color=PIPE_GREEN,
            slider_color_dark=PIPE_GREEN,
            color_accent=QUESTION_GOLD,
            color_accent_soft=COIN_YELLOW,
            color_accent_soft_dark=f"{QUESTION_DARK}60",
            table_even_background_fill=COIN_YELLOW,
            table_even_background_fill_dark=DARK_SURFACE,
            table_odd_background_fill=GROUND_TAN,
            table_odd_background_fill_dark=DARK_PANEL,
            table_border_color=BLOCK_OUTLINE,
            table_border_color_dark=BLOCK_OUTLINE_DARK,
            table_row_focus=QUESTION_GOLD,
            table_row_focus_dark=QUESTION_DARK,
            panel_border_width="4px",
            panel_border_color=BLOCK_OUTLINE,
            panel_border_color_dark=BLOCK_OUTLINE_DARK,
            panel_background_fill=BRICK_BROWN,
            panel_background_fill_dark=BRICK_DARK,
            loader_color=QUESTION_GOLD,
            loader_color_dark=QUESTION_GOLD,
            error_background_fill="#FCD0D0",
            error_background_fill_dark=f"{colors.red.c900}40",
            error_border_color=colors.red.c600,
            error_border_color_dark=colors.red.c500,
            error_text_color=colors.red.c800,
            error_text_color_dark=colors.red.c300,
            error_icon_color=colors.red.c600,
            error_icon_color_dark=colors.red.c400,
            link_text_color=PIPE_GREEN,
            link_text_color_dark="#40E040",
            link_text_color_hover="#10C010",
            link_text_color_hover_dark="#80FF80",
        )

    @staticmethod
    def css() -> str:
        """Return recommended CSS for clouds and brick textures.

        Usage::

            with gr.Blocks(theme=Mario(), css=Mario.css()) as demo:
                ...
        """
        return _MARIO_CSS
