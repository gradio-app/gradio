from __future__ import annotations


class Theme:
    def _color(self, color: str, number: int = 500):
        return f"var(--color-{color}-{number})"

    def _use(self, property):
        assert property in self.__dict__ and not property.endswith("_dark")
        return f"var(--{property.replace('_', '-')})"

    def _get_theme_css(self):
        css = ":host, :root {\n"
        dark_css = ".dark > * {\n"
        theme_attr = [
            attr for attr in dir(self) if attr not in dir(Theme) or attr.startswith("_")
        ]
        for attr in theme_attr:
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
