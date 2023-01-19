from __future__ import annotations


class Theme:
    def _color(self, color: str, number: int=500):
        return f"var(--color-{color}-{number})"

    def _use(self, property):
        return f"var(--{property.replace('_', '-')})"

def get_theme_css(theme: Theme):
    css = ":root {"
    dark_css = ".dark {"
    theme_attr = [attr for attr in dir(theme) if attr not in dir(Theme)]
    for attr in theme_attr:
        val = getattr(theme, attr)
        attr = attr.replace("_", "-")
        if attr.endswith("-dark"):
            attr = attr[:-5]
            dark_css += f"--{attr}: {val}; "
        else:
            css += f"--{attr}: {val}; "
    css += "}"
    dark_css += "}"
    return css + "\n" + dark_css