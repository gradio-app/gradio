import re

from .utils import colors, size


class Theme:
    def _get_theme_css(self):
        css = ":root {\n"
        dark_css = ".dark {\n"
        for attr, val in self.__dict__.items():
            val = getattr(self, attr)
            if val is None:
                continue
            pattern = r"(\*)([\w_]+)(\b)"

            def repl_func(match):
                word = match.group(2)
                word = word.replace("_", "-")
                return f"var(--{word})"

            val = re.sub(pattern, repl_func, val)

            attr = attr.replace("_", "-")
            if attr.endswith("-dark"):
                attr = attr[:-5]
                dark_css += f"  --{attr}: {val}; \n"
            else:
                css += f"  --{attr}: {val}; \n"
        css += "}"
        dark_css += "}"
        return css + "\n" + dark_css


class Base(Theme):
    def __init__(
        self,
        *,
        primary_hue: colors.Color = colors.blue,
        secondary_hue: colors.Color = colors.blue,
        neutral_hue: colors.Color = colors.gray,
        text_size: size.Size = size.text_md,
        spacing_size: size.Size = size.spacing_md,
        radius_size: size.Size = size.radius_md,
    ):
        """
        Parameters:
            primary_hue: The primary hue of the theme. Load a preset, like gradio.themes.utils.green, or pass your own gradio.themes.utils.Color object.
            secondary_hue: The secondary hue of the theme. Load a preset, like gradio.themes.utils.green, or pass your own gradio.themes.utils.Color object.
            neutral_hue: The neutral hue of the theme, used . Load a preset, like gradio.themes.utils.green, or pass your own gradio.themes.utils.Color object.
            text_size: The size of the text. Load a preset, like gradio.themes.utils.text_small, or pass your own gradio.themes.utils.Size object.
            spacing_size: The size of the spacing. Load a preset, like gradio.themes.utils.spacing_small, or pass your own gradio.themes.utils.Size object.
            radius_size: The radius size of corners. Load a preset, like gradio.themes.utils.radius_small, or pass your own gradio.themes.utils.Size object.
        """
        # Hue ranges
        self.primary_50 = primary_hue.c50
        self.primary_100 = primary_hue.c100
        self.primary_200 = primary_hue.c200
        self.primary_300 = primary_hue.c300
        self.primary_400 = primary_hue.c400
        self.primary_500 = primary_hue.c500
        self.primary_600 = primary_hue.c600
        self.primary_700 = primary_hue.c700
        self.primary_800 = primary_hue.c800
        self.primary_900 = primary_hue.c900
        self.primary_950 = primary_hue.c950

        self.secondary_50 = secondary_hue.c50
        self.secondary_100 = secondary_hue.c100
        self.secondary_200 = secondary_hue.c200
        self.secondary_300 = secondary_hue.c300
        self.secondary_400 = secondary_hue.c400
        self.secondary_500 = secondary_hue.c500
        self.secondary_600 = secondary_hue.c600
        self.secondary_700 = secondary_hue.c700
        self.secondary_800 = secondary_hue.c800
        self.secondary_900 = secondary_hue.c900
        self.secondary_950 = secondary_hue.c950

        self.neutral_50 = neutral_hue.c50
        self.neutral_100 = neutral_hue.c100
        self.neutral_200 = neutral_hue.c200
        self.neutral_300 = neutral_hue.c300
        self.neutral_400 = neutral_hue.c400
        self.neutral_500 = neutral_hue.c500
        self.neutral_600 = neutral_hue.c600
        self.neutral_700 = neutral_hue.c700
        self.neutral_800 = neutral_hue.c800
        self.neutral_900 = neutral_hue.c900
        self.neutral_950 = neutral_hue.c950

        self.spacing_xxs = spacing_size.xxs
        self.spacing_xs = spacing_size.xs
        self.spacing_sm = spacing_size.sm
        self.spacing_md = spacing_size.md
        self.spacing_lg = spacing_size.lg
        self.spacing_xl = spacing_size.xl
        self.spacing_xxl = spacing_size.xxl

        self.radius_xxs = radius_size.xxs
        self.radius_xs = radius_size.xs
        self.radius_sm = radius_size.sm
        self.radius_md = radius_size.md
        self.radius_lg = radius_size.lg
        self.radius_xl = radius_size.xl
        self.radius_xxl = radius_size.xxl

        self.text_xxs = text_size.xxs
        self.text_xs = text_size.xs
        self.text_sm = text_size.sm
        self.text_md = text_size.md
        self.text_lg = text_size.lg
        self.text_xl = text_size.xl
        self.text_xxl = text_size.xxl

        self.set()

    def set(
        self,
        *,
        # Core Colors
        color_accent="*primary_500",
        color_accent_soft="*primary_50",
        color_accent_soft_dark="*neutral_900",
        color_background_primary="white",
        color_background_primary_dark="*neutral_950",
        color_background_secondary="*neutral_50",
        color_background_secondary_dark="*neutral_900",
        color_border_accent="*primary_300",
        color_border_accent_dark="*neutral_600",
        color_border_primary="*neutral_200",
        color_border_primary_dark="*neutral_700",
        # Text Colors
        text_color_code_background="*neutral_200",
        text_color_code_background_dark="*neutral_800",
        text_color_code_border="*color_border_primary",
        text_color_link="*secondary_600",
        text_color_link_active="*secondary_600",
        text_color_link_active_dark="*secondary_500",
        text_color_link_dark="*secondary_500",
        text_color_link_hover="*secondary_700",
        text_color_link_hover_dark="*secondary_400",
        text_color_link_visited="*secondary_500",
        text_color_link_visited_dark="*secondary_600",
        text_color_subdued="*neutral_400",
        text_color_subdued_dark="*neutral_400",
        # Body
        body_background_color="*color_background_primary",
        body_background_color_dark="*color_background_primary",
        body_text_color="*neutral_800",
        body_text_color_dark="*neutral_100",
        body_text_size="*text_md",
        body_text_weight="400",
        embed_radius="*radius_lg",
        # Shadows
        shadow_drop="rgba(0,0,0,0.05) 0px 1px 2px 0px",
        shadow_drop_lg="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        shadow_inset="rgba(0,0,0,0.05) 0px 2px 4px 0px inset",
        shadow_spread="3px",
        shadow_spread_dark="1px",
        # Layout Atoms
        block_background="*color_background_primary",
        block_background_dark="*neutral_800",
        block_border_color="*color_border_primary",
        block_border_color_dark="*color_border_primary",
        block_border_width="1px",
        block_border_width_dark="1px",
        block_info_color="*text_color_subdued",
        block_info_color_dark="*text_color_subdued",
        block_info_color_size="*text_sm",
        block_info_color_weight="400",
        block_label_background="*color_background_primary",
        block_label_background_dark="*color_background_secondary",
        block_label_border_color="*color_border_primary",
        block_label_border_color_dark="*color_border_primary",
        block_label_border_width="1px",
        block_label_border_width_dark="1px",
        block_label_color="*neutral_500",
        block_label_color_dark="*neutral_200",
        block_label_icon_color="*block_label_color",
        block_label_margin="0",
        block_label_padding="*spacing_sm *spacing_lg",
        block_label_radius="calc(*radius_lg - 1px) 0 calc(*radius_lg - 1px) 0",
        block_label_right_radius="0 calc(*radius_lg - 1px) 0 calc(*radius_lg - 1px)",
        block_label_text_size="*text_sm",
        block_label_text_weight="400",
        block_padding="*spacing_xl calc(*spacing_xl + 2px)",
        block_radius="*radius_lg",
        block_shadow="none",
        block_shadow_dark="none",
        block_title_background="none",
        block_title_background_dark="none",
        block_title_border_color="none",
        block_title_border_color_dark="none",
        block_title_border_width="0px",
        block_title_border_width_dark="0px",
        block_title_color="*neutral_500",
        block_title_color_dark="*neutral_200",
        block_title_padding="0",
        block_title_radius="none",
        block_title_text_size="*text_md",
        block_title_text_weight="400",
        container_radius="*radius_lg",
        form_gap_width="0px",
        layout_gap="*spacing_xxl",
        panel_background="*color_background_secondary",
        panel_background_dark="*color_background_secondary",
        panel_border_color="*color_border_primary",
        panel_border_color_dark="*color_border_primary",
        panel_border_width="0",
        section_text_size="*text_md",
        section_text_weight="400",
        # Component Atoms
        checkbox_background="*color_background_primary",
        checkbox_background_dark="*neutral_800",
        checkbox_background_focus="*color_background_primary",
        checkbox_background_focus_dark="*checkbox_background",
        checkbox_background_hover="*color_background_primary",
        checkbox_background_hover_dark="*checkbox_background",
        checkbox_background_selected="*secondary_600",
        checkbox_background_selected_dark="*secondary_600",
        checkbox_border_color="*neutral_300",
        checkbox_border_color_dark="*neutral_700",
        checkbox_border_color_focus="*secondary_500",
        checkbox_border_color_focus_dark="*secondary_500",
        checkbox_border_color_hover="*neutral_300",
        checkbox_border_color_hover_dark="*neutral_600",
        checkbox_border_color_selected="*secondary_600",
        checkbox_border_color_selected_dark="*secondary_600",
        checkbox_border_radius="*radius_sm",
        checkbox_border_width="*input_border_width",
        checkbox_label_background="*neutral_200",
        checkbox_label_background_dark="*neutral_600",
        checkbox_label_background_hover="*checkbox_label_background",
        checkbox_label_background_hover_dark="*checkbox_label_background",
        checkbox_label_background_selected="*checkbox_label_background",
        checkbox_label_background_selected_dark="*checkbox_label_background",
        checkbox_label_border_color="*color_border_primary",
        checkbox_label_border_color_dark="*color_border_primary",
        checkbox_label_border_color_hover="*color_border_primary",
        checkbox_label_border_color_hover_dark="*color_border_primary",
        checkbox_label_border_width="*input_border_width",
        checkbox_label_gap="*spacing_lg",
        checkbox_label_padding="*spacing_md calc(2 * *spacing_md)",
        checkbox_label_shadow="none",
        checkbox_label_text_size="*text_md",
        checkbox_label_text_weight="400",
        checkbox_shadow="*input_shadow",
        checkbox_text_color="*body_text_color",
        checkbox_text_color_dark="*body_text_color",
        checkbox_text_color_selected="*checkbox_text_color",
        checkbox_text_color_selected_dark="*checkbox_text_color",
        error_background=colors.red.c100,
        error_background_dark="*color_background_primary",
        error_border_color=colors.red.c200,
        error_border_color_dark="*color_border_primary",
        error_border_width="1px",
        error_border_width_dark="*error_border_width",
        error_color=colors.red.c500,
        error_color_dark=colors.red.c500,
        header_text_weight="600",
        input_background="*neutral_100",
        input_background_dark="*neutral_700",
        input_background_focus="*secondary_500",
        input_background_focus_dark="*secondary_600",
        input_background_hover="*input_background",
        input_background_hover_dark="*input_background",
        input_border_color="*color_border_primary",
        input_border_color_dark="*color_border_primary",
        input_border_color_focus="*secondary_300",
        input_border_color_focus_dark="*neutral_700",
        input_border_color_hover="*color_border_primary",
        input_border_color_hover_dark="*color_border_primary",
        input_border_width="0px",
        input_padding="*spacing_xl",
        input_placeholder_color="*neutral_400",
        input_placeholder_color_dark="*neutral_500",
        input_radius="*radius_lg",
        input_shadow="none",
        input_shadow_dark="*input_shadow",
        input_shadow_focus="*input_shadow",
        input_shadow_focus_dark="*input_shadow",
        input_text_size="*text_md",
        input_text_weight="400",
        loader_color="*color_accent",
        loader_color_dark="*loader_color",
        prose_text_size="*text_md",
        prose_text_weight="400",
        slider_color=None,
        slider_color_dark=None,
        stat_color_background="*primary_300",
        stat_color_background_dark="*primary_500",
        table_border_color="*neutral_300",
        table_border_color_dark="*neutral_700",
        table_even_background="white",
        table_even_background_dark="*neutral_950",
        table_odd_background="*neutral_50",
        table_odd_background_dark="*neutral_900",
        table_radius="*radius_lg",
        table_row_focus="*color_accent_soft",
        table_row_focus_dark="*color_accent_soft",
        # Buttons
        button_border_width="*input_border_width",
        button_cancel_background=colors.red.c200,
        button_cancel_background_dark=colors.red.c700,
        button_cancel_background_hover="*button_cancel_background",
        button_cancel_background_hover_dark="*button_cancel_background_hover",
        button_cancel_border_color=colors.red.c200,
        button_cancel_border_color_dark=colors.red.c600,
        button_cancel_border_color_hover="*button_cancel_border_color",
        button_cancel_border_color_hover_dark="*button_cancel_border_color",
        button_cancel_text_color=colors.red.c600,
        button_cancel_text_color_dark="white",
        button_cancel_text_color_hover="*button_cancel_text_color",
        button_cancel_text_color_hover_dark="*button_cancel_text_color",
        button_large_padding="*spacing_lg calc(2 * *spacing_lg)",
        button_large_radius="*radius_lg",
        button_large_text_size="*text_lg",
        button_large_text_weight="600",
        button_primary_background="*primary_200",
        button_primary_background_dark="*primary_700",
        button_primary_background_hover="*button_primary_background",
        button_primary_background_hover_dark="*button_primary_background",
        button_primary_border_color="*primary_200",
        button_primary_border_color_dark="*primary_600",
        button_primary_border_color_hover="*button_primary_border_color",
        button_primary_border_color_hover_dark="*button_primary_border_color",
        button_primary_text_color="*primary_600",
        button_primary_text_color_dark="white",
        button_primary_text_color_hover="*button_primary_text_color",
        button_primary_text_color_hover_dark="*button_primary_text_color",
        button_secondary_background="*neutral_200",
        button_secondary_background_dark="*neutral_600",
        button_secondary_background_hover="*button_secondary_background",
        button_secondary_background_hover_dark="*button_secondary_background",
        button_secondary_border_color="*neutral_200",
        button_secondary_border_color_dark="*neutral_600",
        button_secondary_border_color_hover="*button_secondary_border_color",
        button_secondary_border_color_hover_dark="*button_secondary_border_color",
        button_secondary_text_color="*neutral_700",
        button_secondary_text_color_dark="white",
        button_secondary_text_color_hover="*button_secondary_text_color",
        button_secondary_text_color_hover_dark="*button_secondary_text_color",
        button_shadow="none",
        button_shadow_active="none",
        button_shadow_hover="none",
        button_small_padding="*spacing_sm calc(2 * *spacing_sm)",
        button_small_radius="*radius_lg",
        button_small_text_size="*text_md",
        button_small_text_weight="400",
        button_transition="background-color 0.2s ease",
    ):
        # Core Colors
        self.color_accent = color_accent
        self.color_accent_soft = color_accent_soft
        self.color_accent_soft_dark = color_accent_soft_dark
        self.color_background_primary = color_background_primary
        self.color_background_primary_dark = color_background_primary_dark
        self.color_background_secondary = color_background_secondary
        self.color_background_secondary_dark = color_background_secondary_dark
        self.color_border_accent = color_border_accent
        self.color_border_accent_dark = color_border_accent_dark
        self.color_border_primary = color_border_primary
        self.color_border_primary_dark = color_border_primary_dark
        # Text Colors
        self.text_color_code_background = text_color_code_background
        self.text_color_code_background_dark = text_color_code_background_dark
        self.text_color_code_border = text_color_code_border
        self.text_color_link = text_color_link
        self.text_color_link_active = text_color_link_active
        self.text_color_link_active_dark = text_color_link_active_dark
        self.text_color_link_dark = text_color_link_dark
        self.text_color_link_hover = text_color_link_hover
        self.text_color_link_hover_dark = text_color_link_hover_dark
        self.text_color_link_visited = text_color_link_visited
        self.text_color_link_visited_dark = text_color_link_visited_dark
        self.text_color_subdued = text_color_subdued
        self.text_color_subdued_dark = text_color_subdued_dark
        # Body
        self.body_background_color = body_background_color
        self.body_background_color_dark = body_background_color_dark
        self.body_text_color = body_text_color
        self.body_text_color_dark = body_text_color_dark
        self.body_text_size = body_text_size
        self.body_text_weight = body_text_weight
        self.embed_radius = embed_radius
        # Shadows
        self.shadow_drop = shadow_drop
        self.shadow_drop_lg = shadow_drop_lg
        self.shadow_inset = shadow_inset
        self.shadow_spread = shadow_spread
        self.shadow_spread_dark = shadow_spread_dark
        # Layout Atoms
        self.block_background = block_background
        self.block_background_dark = block_background_dark
        self.block_border_color = block_border_color
        self.block_border_color_dark = block_border_color_dark
        self.block_border_width = block_border_width
        self.block_border_width_dark = block_border_width_dark
        self.block_info_color = block_info_color
        self.block_info_color_dark = block_info_color_dark
        self.block_info_color_size = block_info_color_size
        self.block_info_color_weight = block_info_color_weight
        self.block_label_background = block_label_background
        self.block_label_background_dark = block_label_background_dark
        self.block_label_border_color = block_label_border_color
        self.block_label_border_color_dark = block_label_border_color_dark
        self.block_label_border_width = block_label_border_width
        self.block_label_border_width_dark = block_label_border_width_dark
        self.block_label_color = block_label_color
        self.block_label_color_dark = block_label_color_dark
        self.block_label_icon_color = block_label_icon_color
        self.block_label_margin = block_label_margin
        self.block_label_padding = block_label_padding
        self.block_label_radius = block_label_radius
        self.block_label_right_radius = block_label_right_radius
        self.block_label_text_size = block_label_text_size
        self.block_label_text_weight = block_label_text_weight
        self.block_padding = block_padding
        self.block_radius = block_radius
        self.block_shadow = block_shadow
        self.block_shadow_dark = block_shadow_dark
        self.block_title_background = block_title_background
        self.block_title_background_dark = block_title_background_dark
        self.block_title_border_color = block_title_border_color
        self.block_title_border_color_dark = block_title_border_color_dark
        self.block_title_border_width = block_title_border_width
        self.block_title_border_width_dark = block_title_border_width_dark
        self.block_title_color = block_title_color
        self.block_title_color_dark = block_title_color_dark
        self.block_title_padding = block_title_padding
        self.block_title_radius = block_title_radius
        self.block_title_text_size = block_title_text_size
        self.block_title_text_weight = block_title_text_weight
        self.container_radius = container_radius
        self.form_gap_width = form_gap_width
        self.layout_gap = layout_gap
        self.panel_background = panel_background
        self.panel_background_dark = panel_background_dark
        self.panel_border_color = panel_border_color
        self.panel_border_color_dark = panel_border_color_dark
        self.panel_border_width = panel_border_width
        self.section_text_size = section_text_size
        self.section_text_weight = section_text_weight
        # Component Atoms
        self.checkbox_background = checkbox_background
        self.checkbox_background_dark = checkbox_background_dark
        self.checkbox_background_focus = checkbox_background_focus
        self.checkbox_background_focus_dark = checkbox_background_focus_dark
        self.checkbox_background_hover = checkbox_background_hover
        self.checkbox_background_hover_dark = checkbox_background_hover_dark
        self.checkbox_background_selected = checkbox_background_selected
        self.checkbox_background_selected_dark = checkbox_background_selected_dark
        self.checkbox_border_color = checkbox_border_color
        self.checkbox_border_color_dark = checkbox_border_color_dark
        self.checkbox_border_color_focus = checkbox_border_color_focus
        self.checkbox_border_color_focus_dark = checkbox_border_color_focus_dark
        self.checkbox_border_color_hover = checkbox_border_color_hover
        self.checkbox_border_color_hover_dark = checkbox_border_color_hover_dark
        self.checkbox_border_color_selected = checkbox_border_color_selected
        self.checkbox_border_color_selected_dark = checkbox_border_color_selected_dark
        self.checkbox_border_radius = checkbox_border_radius
        self.checkbox_border_width = checkbox_border_width
        self.checkbox_label_background = checkbox_label_background
        self.checkbox_label_background_dark = checkbox_label_background_dark
        self.checkbox_label_background_hover = checkbox_label_background_hover
        self.checkbox_label_background_hover_dark = checkbox_label_background_hover_dark
        self.checkbox_label_background_selected = checkbox_label_background_selected
        self.checkbox_label_background_selected_dark = (
            checkbox_label_background_selected_dark
        )
        self.checkbox_label_border_color = checkbox_label_border_color
        self.checkbox_label_border_color_dark = checkbox_label_border_color_dark
        self.checkbox_label_border_color_hover = checkbox_label_border_color_hover
        self.checkbox_label_border_color_hover_dark = (
            checkbox_label_border_color_hover_dark
        )
        self.checkbox_label_border_width = checkbox_label_border_width
        self.checkbox_label_gap = checkbox_label_gap
        self.checkbox_label_padding = checkbox_label_padding
        self.checkbox_label_shadow = checkbox_label_shadow
        self.checkbox_label_text_size = checkbox_label_text_size
        self.checkbox_label_text_weight = checkbox_label_text_weight
        self.checkbox_shadow = checkbox_shadow
        self.checkbox_text_color = checkbox_text_color
        self.checkbox_text_color_dark = checkbox_text_color_dark
        self.checkbox_text_color_selected = checkbox_text_color_selected
        self.checkbox_text_color_selected_dark = checkbox_text_color_selected_dark
        self.error_background = error_background
        self.error_background_dark = error_background_dark
        self.error_border_color = error_border_color
        self.error_border_color_dark = error_border_color_dark
        self.error_border_width = error_border_width
        self.error_border_width_dark = error_border_width_dark
        self.error_color = error_color
        self.error_color_dark = error_color_dark
        self.header_text_weight = header_text_weight
        self.input_background = input_background
        self.input_background_dark = input_background_dark
        self.input_background_focus = input_background_focus
        self.input_background_focus_dark = input_background_focus_dark
        self.input_background_hover = input_background_hover
        self.input_background_hover_dark = input_background_hover_dark
        self.input_border_color = input_border_color
        self.input_border_color_dark = input_border_color_dark
        self.input_border_color_focus = input_border_color_focus
        self.input_border_color_focus_dark = input_border_color_focus_dark
        self.input_border_color_hover = input_border_color_hover
        self.input_border_color_hover_dark = input_border_color_hover_dark
        self.input_border_width = input_border_width
        self.input_padding = input_padding
        self.input_placeholder_color = input_placeholder_color
        self.input_placeholder_color_dark = input_placeholder_color_dark
        self.input_radius = input_radius
        self.input_shadow = input_shadow
        self.input_shadow_dark = input_shadow_dark
        self.input_shadow_focus = input_shadow_focus
        self.input_shadow_focus_dark = input_shadow_focus_dark
        self.input_text_size = input_text_size
        self.input_text_weight = input_text_weight
        self.loader_color = loader_color
        self.loader_color_dark = loader_color_dark
        self.prose_text_size = prose_text_size
        self.prose_text_weight = prose_text_weight
        self.slider_color = slider_color
        self.slider_color_dark = slider_color_dark
        self.stat_color_background = stat_color_background
        self.stat_color_background_dark = stat_color_background_dark
        self.table_border_color = table_border_color
        self.table_border_color_dark = table_border_color_dark
        self.table_even_background = table_even_background
        self.table_even_background_dark = table_even_background_dark
        self.table_odd_background = table_odd_background
        self.table_odd_background_dark = table_odd_background_dark
        self.table_radius = table_radius
        self.table_row_focus = table_row_focus
        self.table_row_focus_dark = table_row_focus_dark
        # Buttons
        self.button_border_width = button_border_width
        self.button_cancel_background = button_cancel_background
        self.button_cancel_background_dark = button_cancel_background_dark
        self.button_cancel_background_hover = button_cancel_background_hover
        self.button_cancel_background_hover_dark = button_cancel_background_hover_dark
        self.button_cancel_border_color = button_cancel_border_color
        self.button_cancel_border_color_dark = button_cancel_border_color_dark
        self.button_cancel_border_color_hover = button_cancel_border_color_hover
        self.button_cancel_border_color_hover_dark = (
            button_cancel_border_color_hover_dark
        )
        self.button_cancel_text_color = button_cancel_text_color
        self.button_cancel_text_color_dark = button_cancel_text_color_dark
        self.button_cancel_text_color_hover = button_cancel_text_color_hover
        self.button_cancel_text_color_hover_dark = button_cancel_text_color_hover_dark
        self.button_large_padding = button_large_padding
        self.button_large_radius = button_large_radius
        self.button_large_text_size = button_large_text_size
        self.button_large_text_weight = button_large_text_weight
        self.button_primary_background = button_primary_background
        self.button_primary_background_dark = button_primary_background_dark
        self.button_primary_background_hover = button_primary_background_hover
        self.button_primary_background_hover_dark = button_primary_background_hover_dark
        self.button_primary_border_color = button_primary_border_color
        self.button_primary_border_color_dark = button_primary_border_color_dark
        self.button_primary_border_color_hover = button_primary_border_color_hover
        self.button_primary_border_color_hover_dark = (
            button_primary_border_color_hover_dark
        )
        self.button_primary_text_color = button_primary_text_color
        self.button_primary_text_color_dark = button_primary_text_color_dark
        self.button_primary_text_color_hover = button_primary_text_color_hover
        self.button_primary_text_color_hover_dark = button_primary_text_color_hover_dark
        self.button_secondary_background = button_secondary_background
        self.button_secondary_background_dark = button_secondary_background_dark
        self.button_secondary_background_hover = button_secondary_background_hover
        self.button_secondary_background_hover_dark = (
            button_secondary_background_hover_dark
        )
        self.button_secondary_border_color = button_secondary_border_color
        self.button_secondary_border_color_dark = button_secondary_border_color_dark
        self.button_secondary_border_color_hover = button_secondary_border_color_hover
        self.button_secondary_border_color_hover_dark = (
            button_secondary_border_color_hover_dark
        )
        self.button_secondary_text_color = button_secondary_text_color
        self.button_secondary_text_color_dark = button_secondary_text_color_dark
        self.button_secondary_text_color_hover = button_secondary_text_color_hover
        self.button_secondary_text_color_hover_dark = (
            button_secondary_text_color_hover_dark
        )
        self.button_shadow = button_shadow
        self.button_shadow_active = button_shadow_active
        self.button_shadow_hover = button_shadow_hover
        self.button_small_padding = button_small_padding
        self.button_small_radius = button_small_radius
        self.button_small_text_size = button_small_text_size
        self.button_small_text_weight = button_small_text_weight
        self.button_transition = button_transition
