from __future__ import annotations

import warnings
from typing import Dict

from gradio.context import Context
from gradio.themes.base import Base, ThemeClass
from gradio.themes.default import Default
from gradio.themes.glass import Glass
from gradio.themes.monochrome import Monochrome
from gradio.themes.soft import Soft
from gradio.themes.utils import colors, sizes
from gradio.themes.utils.colors import Color
from gradio.themes.utils.fonts import Font, GoogleFont
from gradio.themes.utils.sizes import Size

__all__ = [
    "Base",
    "Color",
    "Default",
    "Font",
    "Glass",
    "GoogleFont",
    "Monochrome",
    "Size",
    "Soft",
    "ThemeClass",
    "colors",
    "is_custom_theme",
    "resolve_theme",
    "sizes",
]


def builder(*args, **kwargs):
    from gradio.themes.builder import demo

    return demo.launch(*args, **kwargs)


_built_in_themes: Dict[str, ThemeClass] = {
    t.name: t
    for t in [
        Base(),
        Default(),
        Monochrome(),
        Soft(),
        Glass(),
    ]
}


def resolve_theme(theme: ThemeClass | str | None) -> ThemeClass:
    """
    Resolve a theme reference to a Theme object.

    Args:
        theme: A theme reference. Can be a theme object, a string referring to a built-in theme or a hub reference, or None. In case of None, the configured default theme is returned.

    Returns:
        A theme object.
    """
    if isinstance(theme, str):
        if theme.lower() in _built_in_themes:
            return _built_in_themes[theme.lower()]
        try:
            return ThemeClass.from_hub(theme)
        except Exception as e:
            warnings.warn(f"Cannot load {theme}. Caught Exception: {str(e)}")
            theme = None
    if not isinstance(theme, ThemeClass):
        if theme is not None:
            warnings.warn("Theme should be a class loaded from gradio.themes")
        theme = Context.default_theme or Default()
    return theme


def is_custom_theme(theme: ThemeClass) -> bool:
    """
    Find out whether the given theme differs from any of the built-in themes.

    Args:
        theme: The theme.

    Returns:
        True if the theme is custom, False otherwise.
    """
    t_dict = theme.to_dict()
    return not any(
        t_dict == built_in_theme.to_dict()
        for built_in_theme in _built_in_themes.values()
    )
