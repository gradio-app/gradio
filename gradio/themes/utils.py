from __future__ import annotations


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
