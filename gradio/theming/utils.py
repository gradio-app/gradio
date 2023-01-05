class Theme:
    pass

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