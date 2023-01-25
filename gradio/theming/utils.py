from __future__ import annotations


class Theme:
    def _color(self, color: str, number: int=500):
        return f"var(--color-{color}-{number})"

    def _use(self, property):
        # assert property in self.__dict__
        if not property in self.__dict__:
            print("property not found: ", property)
        return f"var(--{property.replace('_', '-')})"

def get_theme_css(theme: Theme):
    css = ":root {\n"
    dark_css = ".dark {\n"
    theme_attr = [attr for attr in dir(theme) if attr not in dir(Theme)]
    for attr in theme_attr:
        val = getattr(theme, attr)
        attr = attr.replace("_", "-")
        if attr.endswith("-dark"):
            attr = attr[:-5]
            dark_css += f"  --{attr}: {val}; \n"
        else:
            css += f"  --{attr}: {val}; \n"
    css += "}"
    dark_css += "}"
    return css + "\n" + dark_css