from __future__ import annotations

NOT_IMPLEMENTED = "__NOT_IMPLEMENTED__"

class Color:
    def __init__(self, c10, c50, c100, c200, c300, c400, c500, c600, c700, c800, c900, c950):
        self.c10 = c10
        self.c50 = c50
        self.c100 = c100
        self.c200 = c200
        self.c300 = c300
        self.c400 = c400
        self.c500 = c500
        self.c600 = c600
        self.c700 = c700
        self.c800 = c800
        self.c900 = c900
        self.c950 = c950

class Theme:
    def __init__(self):
        # Core values
        self.color_accent_base = NOT_IMPLEMENTED
        self.color_accent_soft = NOT_IMPLEMENTED
        self.color_accent_soft_dark = NOT_IMPLEMENTED
        self.color_border_primary = NOT_IMPLEMENTED
        self.color_border_primary_dark = NOT_IMPLEMENTED
        self.color_border_secondary = NOT_IMPLEMENTED
        self.color_border_secondary_dark = NOT_IMPLEMENTED
        self.color_border_tertiary = NOT_IMPLEMENTED
        self.color_border_tertiary_dark = NOT_IMPLEMENTED
        self.color_border_highlight = NOT_IMPLEMENTED
        self.color_focus_primary = NOT_IMPLEMENTED
        self.color_focus_primary_dark = NOT_IMPLEMENTED
        self.color_focus_secondary = NOT_IMPLEMENTED
        self.color_focus_secondary_dark = NOT_IMPLEMENTED
        self.color_focus_ring = NOT_IMPLEMENTED
        self.color_focus_ring_dark = NOT_IMPLEMENTED
        self.color_background_primary = NOT_IMPLEMENTED
        self.color_background_primary_dark = NOT_IMPLEMENTED
        self.color_background_secondary = NOT_IMPLEMENTED
        self.color_background_secondary_dark = NOT_IMPLEMENTED
        self.color_background_hover = NOT_IMPLEMENTED
        self.color_background_tertiary = NOT_IMPLEMENTED
        self.color_background_tertiary_dark = NOT_IMPLEMENTED
        self.color_stat_background = NOT_IMPLEMENTED
        self.color_stat_background_dark = NOT_IMPLEMENTED
        self.rounded_sm = NOT_IMPLEMENTED
        self.rounded = NOT_IMPLEMENTED
        self.rounded_lg = NOT_IMPLEMENTED
        self.rounded_xl = NOT_IMPLEMENTED
        self.rounded_xxl = NOT_IMPLEMENTED
        self.rounded_full = NOT_IMPLEMENTED
        self.internal_border_width = NOT_IMPLEMENTED

        # Text colors
        self.color_text_body = NOT_IMPLEMENTED
        self.color_text_body_dark = NOT_IMPLEMENTED
        self.color_text_label = NOT_IMPLEMENTED
        self.color_text_label_dark = NOT_IMPLEMENTED
        self.color_text_placeholder = NOT_IMPLEMENTED
        self.color_text_placeholder_dark = NOT_IMPLEMENTED
        self.color_text_subdued = NOT_IMPLEMENTED
        self.color_text_subdued_dark = NOT_IMPLEMENTED
        self.color_text_link_base = NOT_IMPLEMENTED
        self.color_text_link_base_dark = NOT_IMPLEMENTED
        self.color_text_link_hover = NOT_IMPLEMENTED
        self.color_text_link_hover_dark = NOT_IMPLEMENTED
        self.color_text_link_visited = NOT_IMPLEMENTED
        self.color_text_link_visited_dark = NOT_IMPLEMENTED
        self.color_text_link_active = NOT_IMPLEMENTED
        self.color_text_link_active_dark = NOT_IMPLEMENTED
        self.color_text_code_background = NOT_IMPLEMENTED
        self.color_text_code_background_dark = NOT_IMPLEMENTED
        self.color_text_code_border = NOT_IMPLEMENTED

        # Functional colors
        self.color_functional_error_base = NOT_IMPLEMENTED
        self.color_functional_error_base_dark = NOT_IMPLEMENTED
        self.color_functional_error_subdued = NOT_IMPLEMENTED
        self.color_functional_error_subdued_dark = NOT_IMPLEMENTED
        self.color_functional_error_background = NOT_IMPLEMENTED
        self.color_functional_error_background_dark = NOT_IMPLEMENTED
        self.color_functional_error_border = NOT_IMPLEMENTED
        self.color_functional_error_border_dark = NOT_IMPLEMENTED

        self.color_functional_info_base = NOT_IMPLEMENTED
        self.color_functional_info_subdued = NOT_IMPLEMENTED
        self.color_functional_success_base = NOT_IMPLEMENTED
        self.color_functional_success_subdued = NOT_IMPLEMENTED

        # Shadow
        self.shadow_drop = NOT_IMPLEMENTED
        self.shadow_drop_lg = NOT_IMPLEMENTED
        self.shadow_inset = NOT_IMPLEMENTED
        self.shadow_spread = NOT_IMPLEMENTED
        self.shadow_spread_dark = NOT_IMPLEMENTED

        # Atoms
        self.block_label_border_color = NOT_IMPLEMENTED
        self.block_label_icon_color = NOT_IMPLEMENTED
        self.block_label_background = NOT_IMPLEMENTED
        self.block_label_background_dark = NOT_IMPLEMENTED
        self.icon_button_icon_color_base = NOT_IMPLEMENTED
        self.icon_button_icon_color_hover = NOT_IMPLEMENTED
        self.icon_button_background_base = NOT_IMPLEMENTED
        self.icon_button_background_hover = NOT_IMPLEMENTED
        self.icon_button_border_color_base = NOT_IMPLEMENTED
        self.icon_button_border_color_hover = NOT_IMPLEMENTED
        self.info_color_base = NOT_IMPLEMENTED
        self.info_color_base_dark = NOT_IMPLEMENTED
        self.input_border_color_base = NOT_IMPLEMENTED
        self.input_border_color_base_dark = NOT_IMPLEMENTED
        self.input_border_color_hover = NOT_IMPLEMENTED
        self.input_border_color_hover_dark = NOT_IMPLEMENTED
        self.input_border_color_focus = NOT_IMPLEMENTED
        self.input_border_color_focus_dark = NOT_IMPLEMENTED
        self.input_background_base = NOT_IMPLEMENTED
        self.input_background_base_dark = NOT_IMPLEMENTED
        self.input_background_hover = NOT_IMPLEMENTED
        self.input_background_hover_dark = NOT_IMPLEMENTED
        self.input_background_focus = NOT_IMPLEMENTED
        self.input_background_focus_dark = NOT_IMPLEMENTED
        self.input_accent = NOT_IMPLEMENTED
        self.checkbox_border_radius = NOT_IMPLEMENTED
        self.checkbox_border_color_base = NOT_IMPLEMENTED
        self.checkbox_border_color_base_dark = NOT_IMPLEMENTED
        self.checkbox_border_color_hover = NOT_IMPLEMENTED
        self.checkbox_border_color_hover_dark = NOT_IMPLEMENTED
        self.checkbox_border_color_focus = NOT_IMPLEMENTED
        self.checkbox_border_color_focus_dark = NOT_IMPLEMENTED
        self.checkbox_border_color_selected = NOT_IMPLEMENTED
        self.checkbox_background_base = NOT_IMPLEMENTED
        self.checkbox_background_base_dark = NOT_IMPLEMENTED
        self.checkbox_background_hover = NOT_IMPLEMENTED
        self.checkbox_background_hover_dark = NOT_IMPLEMENTED
        self.checkbox_background_focus = NOT_IMPLEMENTED
        self.checkbox_background_focus_dark = NOT_IMPLEMENTED
        self.checkbox_background_selected = NOT_IMPLEMENTED
        self.checkbox_label_border_color_base = NOT_IMPLEMENTED
        self.checkbox_label_border_color_base_dark = NOT_IMPLEMENTED
        self.checkbox_label_border_color_hover = NOT_IMPLEMENTED
        self.checkbox_label_border_color_hover_dark = NOT_IMPLEMENTED
        self.checkbox_label_border_color_focus = NOT_IMPLEMENTED
        self.checkbox_label_border_color_focus_dark = NOT_IMPLEMENTED
        self.checkbox_label_background_base = NOT_IMPLEMENTED
        self.checkbox_label_background_base_dark = NOT_IMPLEMENTED
        self.checkbox_label_background_hover = NOT_IMPLEMENTED
        self.checkbox_label_background_hover_dark = NOT_IMPLEMENTED
        self.checkbox_label_background_focus = NOT_IMPLEMENTED
        self.checkbox_label_background_focus_dark = NOT_IMPLEMENTED
        self.table_even_background = NOT_IMPLEMENTED
        self.table_even_background_dark = NOT_IMPLEMENTED
        self.table_odd_background = NOT_IMPLEMENTED
        self.table_odd_background_dark = NOT_IMPLEMENTED
        self.table_row_focus = NOT_IMPLEMENTED
        self.table_row_focus_dark = NOT_IMPLEMENTED

        # Buttons
        self.button_shadow = NOT_IMPLEMENTED
        self.button_shadow_hover = NOT_IMPLEMENTED
        self.button_shadow_active = NOT_IMPLEMENTED
        self.button_primary_border_color_base = NOT_IMPLEMENTED
        self.button_primary_border_color_base_dark = NOT_IMPLEMENTED
        self.button_primary_border_color_hover = NOT_IMPLEMENTED
        self.button_primary_border_color_hover_dark = NOT_IMPLEMENTED
        self.button_primary_border_color_focus = NOT_IMPLEMENTED
        self.button_primary_border_color_focus_dark = NOT_IMPLEMENTED
        self.button_primary_text_color_base = NOT_IMPLEMENTED
        self.button_primary_text_color_base_dark = NOT_IMPLEMENTED
        self.button_primary_text_color_hover = NOT_IMPLEMENTED
        self.button_primary_text_color_hover_dark = NOT_IMPLEMENTED
        self.button_primary_text_color_focus = NOT_IMPLEMENTED
        self.button_primary_text_color_focus_dark = NOT_IMPLEMENTED
        self.button_primary_background_base = NOT_IMPLEMENTED
        self.button_primary_background_base_dark = NOT_IMPLEMENTED
        self.button_primary_background_hover = NOT_IMPLEMENTED
        self.button_primary_background_hover_dark = NOT_IMPLEMENTED
        self.button_primary_background_focus = NOT_IMPLEMENTED
        self.button_primary_background_focus_dark = NOT_IMPLEMENTED
        self.button_secondary_border_color_base = NOT_IMPLEMENTED
        self.button_secondary_border_color_base_dark = NOT_IMPLEMENTED
        self.button_secondary_border_color_hover = NOT_IMPLEMENTED
        self.button_secondary_border_color_hover_dark = NOT_IMPLEMENTED
        self.button_secondary_border_color_focus = NOT_IMPLEMENTED
        self.button_secondary_border_color_focus_dark = NOT_IMPLEMENTED
        self.button_secondary_text_color_base = NOT_IMPLEMENTED
        self.button_secondary_text_color_base_dark = NOT_IMPLEMENTED
        self.button_secondary_text_color_hover = NOT_IMPLEMENTED
        self.button_secondary_text_color_hover_dark = NOT_IMPLEMENTED
        self.button_secondary_text_color_focus = NOT_IMPLEMENTED
        self.button_secondary_text_color_focus_dark = NOT_IMPLEMENTED
        self.button_secondary_background_base = NOT_IMPLEMENTED
        self.button_secondary_background_base_dark = NOT_IMPLEMENTED
        self.button_secondary_background_hover = NOT_IMPLEMENTED
        self.button_secondary_background_hover_dark = NOT_IMPLEMENTED
        self.button_secondary_background_focus = NOT_IMPLEMENTED
        self.button_secondary_background_focus_dark = NOT_IMPLEMENTED
        self.button_cancel_border_color_base = NOT_IMPLEMENTED
        self.button_cancel_border_color_base_dark = NOT_IMPLEMENTED
        self.button_cancel_border_color_hover = NOT_IMPLEMENTED
        self.button_cancel_border_color_hover_dark = NOT_IMPLEMENTED
        self.button_cancel_border_color_focus = NOT_IMPLEMENTED
        self.button_cancel_border_color_focus_dark = NOT_IMPLEMENTED
        self.button_cancel_text_color_base = NOT_IMPLEMENTED
        self.button_cancel_text_color_base_dark = NOT_IMPLEMENTED
        self.button_cancel_text_color_hover = NOT_IMPLEMENTED
        self.button_cancel_text_color_hover_dark = NOT_IMPLEMENTED
        self.button_cancel_text_color_focus = NOT_IMPLEMENTED
        self.button_cancel_text_color_focus_dark = NOT_IMPLEMENTED
        self.button_cancel_background_base = NOT_IMPLEMENTED
        self.button_cancel_background_base_dark = NOT_IMPLEMENTED
        self.button_cancel_background_hover = NOT_IMPLEMENTED
        self.button_cancel_background_hover_dark = NOT_IMPLEMENTED
        self.button_cancel_background_focus = NOT_IMPLEMENTED
        self.button_cancel_background_focus_dark = NOT_IMPLEMENTED
        self.button_plain_border_color_base = NOT_IMPLEMENTED
        self.button_plain_border_color_base_dark = NOT_IMPLEMENTED
        self.button_plain_border_color_hover = NOT_IMPLEMENTED
        self.button_plain_border_color_hover_dark = NOT_IMPLEMENTED
        self.button_plain_border_color_focus = NOT_IMPLEMENTED
        self.button_plain_border_color_focus_dark = NOT_IMPLEMENTED
        self.button_plain_text_color_base = NOT_IMPLEMENTED
        self.button_plain_text_color_base_dark = NOT_IMPLEMENTED
        self.button_plain_text_color_hover = NOT_IMPLEMENTED
        self.button_plain_text_color_hover_dark = NOT_IMPLEMENTED
        self.button_plain_text_color_focus = NOT_IMPLEMENTED
        self.button_plain_text_color_focus_dark = NOT_IMPLEMENTED
        self.button_plain_background_base = NOT_IMPLEMENTED
        self.button_plain_background_base_dark = NOT_IMPLEMENTED
        self.button_plain_background_hover = NOT_IMPLEMENTED
        self.button_plain_background_hover_dark = NOT_IMPLEMENTED
        self.button_plain_background_focus = NOT_IMPLEMENTED
        self.button_plain_background_focus_dark = NOT_IMPLEMENTED
     

    def _color(self, color: Color, number: int = 500):
        return getattr(color, f"c{number}")

    def _use(self, property):
        assert property in self.__dict__ and not property.endswith("_dark")
        return f"var(--{property.replace('_', '-')})"

    def _get_theme_css(self):
        css = ":host, :root {\n"
        dark_css = ".dark {\n"
        for attr, val in self.__dict__.items():
            val = getattr(self, attr)
            if val == NOT_IMPLEMENTED:
                raise NotImplementedError(f"Theme property {attr} not implemented")
            if val is None:
                continue
            attr = attr.replace("_", "-")
            if attr.endswith("-dark"):
                attr = attr[:-5]
                dark_css += f"  --{attr}: {val}; \n"
            else:
                css += f"  --{attr}: {val}; \n"
        css += "}"
        dark_css += "}"
        return css + "\n" + dark_css
