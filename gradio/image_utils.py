from __future__ import annotations

from pathlib import Path
from typing import Literal

import numpy as np
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import processing_utils

_Image.init()


def format_image(
    im: _Image.Image | None,
    type: Literal["numpy", "pil", "filepath"],
    cache_dir: str,
) -> np.ndarray | _Image.Image | str | None:
    """Helper method to format an image based on self.type"""
    if im is None:
        return im
    fmt = im.format
    if type == "pil":
        return im
    elif type == "numpy":
        return np.array(im)
    elif type == "filepath":
        path = processing_utils.save_pil_to_cache(
            im, cache_dir=cache_dir, format=fmt or "png"  # type: ignore
        )
        return path
    else:
        raise ValueError(
            "Unknown type: "
            + str(type)
            + ". Please choose from: 'numpy', 'pil', 'filepath'."
        )


def save_image(y: np.ndarray | _Image.Image | str | Path, cache_dir: str):
    if isinstance(y, np.ndarray):
        path = processing_utils.save_img_array_to_cache(y, cache_dir=cache_dir)
    elif isinstance(y, _Image.Image):
        path = processing_utils.save_pil_to_cache(y, cache_dir=cache_dir)
    elif isinstance(y, Path):
        path = str(y)
    elif isinstance(y, str):
        path = y
    else:
        raise ValueError("Cannot process this value as an Image")

    return path
