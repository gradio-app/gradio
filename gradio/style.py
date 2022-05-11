from typing import Any, Callable, Dict, List, Optional, Tuple

def style(
    target: str = "main",
    border_width: Optional[int] = None,
    border_color: Optional[str] = None,
    rounded: Optional[bool] = None,
    background_color: Optional[str] = None,
    text_color: Optional[str] = None,
    text_size: Optional[int] = None,
    bold: Optional[bool] = None,
    visible: Optional[bool] = None,
    height: Optional[int] = None,
    width: Optional[int] = None,
    **kwargs
    ):
        style_dict = {"target": target}
        if border_width is not None:
            style_dict["border-width"] = str(border_width) + "px"
        if border_color is not None:
            style_dict["border-color"] = border_color
        if rounded:
            style_dict["border-radius"] = "0.5rem"
        if background_color is not None:
            style_dict["background-color"] = background_color
        if text_color is not None:
            style_dict["color"] = text_color
        if text_size is not None:
            style_dict["font-size"] = str(text_size) + "px"
        if bold:
            style_dict["font-weight"] = "bold"
        if visible == False:
            style_dict["display"] = "bold"
        if height is not None:
            style_dict["height"] = "100%" if height is -1 else str(height) + "px"
        if width is not None:
            style_dict["width"] = "100%" if width is -1 else str(width) + "px"
        style_dict.update(kwargs)
        return style_dict
