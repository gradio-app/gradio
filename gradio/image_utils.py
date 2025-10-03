from __future__ import annotations

import base64
import warnings
from io import BytesIO
from pathlib import Path
from typing import Literal, cast
from urllib.parse import quote

import httpx
import numpy as np
import PIL.Image
from gradio_client.utils import get_mimetype, is_http_url_like
from PIL import ImageOps

from gradio import processing_utils
from gradio.components.image_editor import WatermarkOptions
from gradio.data_classes import ImageData
from gradio.exceptions import Error

PIL.Image.init()  # fixes https://github.com/gradio-app/gradio/issues/2843 (remove when requiring Pillow 9.4+)


def open_image(orig_img: np.ndarray | PIL.Image.Image | str | Path) -> PIL.Image.Image:
    """
    Provided an array, PIL Image or filepath, return a PIL Image.
    Parameters:
        orig_img: Local image file. If a filepath, it must be a webp, png, jpeg, or bmp.
    Returns:
        open_img: A PIL.Image.Image.
    """

    if isinstance(orig_img, np.ndarray):
        open_img = PIL.Image.fromarray(orig_img)
    elif isinstance(orig_img, (str, Path)):
        open_img = PIL.Image.open(orig_img)
    elif isinstance(orig_img, PIL.Image.Image):
        open_img = orig_img
    else:
        raise ValueError(
            "Expected image or path to image of type webp, png, bmp or jpeg; PIL image; or numpy array. Received  "
            + str(type(orig_img))
        )
    return open_img


def format_image(
    im: PIL.Image.Image | None,
    type: Literal["numpy", "pil", "filepath"],
    cache_dir: str,
    name: str = "image",
    format: str = "webp",
) -> np.ndarray | PIL.Image.Image | str | None:
    """Helper method to format an image based on self.type"""
    if im is None:
        return im
    if type == "pil":
        return im
    elif type == "numpy":
        return np.array(im)
    elif type == "filepath":
        try:
            path = processing_utils.save_pil_to_cache(
                im, cache_dir=cache_dir, name=name, format=format
            )
        # Catch error if format is not supported by PIL
        except (KeyError, ValueError):
            path = processing_utils.save_pil_to_cache(
                im,
                cache_dir=cache_dir,
                name=name,
                format="png",  # type: ignore
            )
        return path
    else:
        raise ValueError(
            "Unknown type: "
            + str(type)
            + ". Please choose from: 'numpy', 'pil', 'filepath'."
        )


def save_image(
    y: np.ndarray | PIL.Image.Image | str | Path, cache_dir: str, format: str = "webp"
):
    if isinstance(y, np.ndarray):
        path = processing_utils.save_img_array_to_cache(
            y, cache_dir=cache_dir, format=format
        )
    elif isinstance(y, PIL.Image.Image):
        try:
            path = processing_utils.save_pil_to_cache(
                y, cache_dir=cache_dir, format=format
            )
        # Catch error if format is not supported by PIL
        except (KeyError, ValueError):
            path = processing_utils.save_pil_to_cache(
                y, cache_dir=cache_dir, format="png"
            )
    elif isinstance(y, Path):
        path = str(y)
    elif isinstance(y, str):
        path = y
    else:
        raise ValueError(
            "Cannot process this value as an Image, it is of type: " + str(type(y))
        )

    return path


def add_watermark(
    base_img: np.ndarray | PIL.Image.Image | str | Path,
    watermark_option: WatermarkOptions,
) -> PIL.Image.Image:
    """Overlays a watermark image on a base image.
    Parameters:
        base_img: Base image onto which the watermark is applied. Can be an array, PIL Image, or filepath.
        watermarkOption: WatermarkOptions instance containing watermark image and position settings.
    Returns:
        watermarked_img: A PIL Image of the base image overlaid with the watermark image.
    """
    base_img = open_image(base_img)
    base_img_width, base_img_height = base_img.size
    watermark_option.watermark = open_image(
        cast(np.ndarray | PIL.Image.Image | str | Path, watermark_option.watermark)
    )
    watermark_width, watermark_height = watermark_option.watermark.size

    if isinstance(watermark_option.position, str):
        padding = 10
        if watermark_option.position == "top-left":
            x, y = padding, padding
        elif watermark_option.position == "top-right":
            x, y = base_img_width - watermark_width - padding, padding
        elif watermark_option.position == "bottom-left":
            x, y = padding, base_img_height - watermark_height - padding
        elif watermark_option.position == "bottom-right":
            x, y = (
                base_img_width - watermark_width - padding,
                base_img_height - watermark_height - padding,
            )
    else:
        x, y = watermark_option.position

    if (
        x < 0
        or x + watermark_width > base_img_width
        or y < 0
        or y + watermark_height > base_img_height
    ):
        x = base_img_width - watermark_width - 10
        y = base_img_height - watermark_height - 10

    watermark_position = (x, y)
    orig_img_mode = base_img.mode
    base_img = base_img.convert("RGBA")
    watermark_option.watermark = watermark_option.watermark.convert("RGBA")
    base_img.paste(
        watermark_option.watermark, watermark_position, mask=watermark_option.watermark
    )
    base_img = base_img.convert(orig_img_mode)

    return base_img


def crop_scale(img: PIL.Image.Image, final_width: int, final_height: int):
    original_width, original_height = img.size
    target_aspect_ratio = final_width / final_height

    if original_width / original_height > target_aspect_ratio:
        crop_height = original_height
        crop_width = crop_height * target_aspect_ratio
    else:
        crop_width = original_width
        crop_height = crop_width / target_aspect_ratio

    left = (original_width - crop_width) / 2
    top = (original_height - crop_height) / 2

    img_cropped = img.crop(
        (int(left), int(top), int(left + crop_width), int(top + crop_height))
    )

    img_resized = img_cropped.resize((final_width, final_height))

    return img_resized


def decode_base64_to_image(encoding: str) -> PIL.Image.Image:
    image_encoded = processing_utils.extract_base64_data(encoding)
    img = PIL.Image.open(BytesIO(base64.b64decode(image_encoded)))
    try:
        if hasattr(ImageOps, "exif_transpose"):
            img = ImageOps.exif_transpose(img)
    except Exception:
        print(
            "Failed to transpose image %s based on EXIF data.",
            img,
        )
    assert img is not None  # noqa: S101
    return img


def decode_base64_to_image_array(encoding: str) -> np.ndarray:
    img = decode_base64_to_image(encoding)
    return np.asarray(img)


def decode_base64_to_file(encoding: str, cache_dir: str, format: str = "webp") -> str:
    img = decode_base64_to_image(encoding)
    return save_image(img, cache_dir, format)


def encode_image_array_to_base64(image_array: np.ndarray) -> str:
    with BytesIO() as output_bytes:
        pil_image = PIL.Image.fromarray(
            processing_utils._convert(image_array, np.uint8, force_copy=False)
        )
        pil_image.save(output_bytes, "JPEG")
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return "data:image/jpeg;base64," + base64_str


def encode_image_to_base64(image: PIL.Image.Image) -> str:
    with BytesIO() as output_bytes:
        image.save(output_bytes, "JPEG")
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return "data:image/jpeg;base64," + base64_str


def encode_image_file_to_base64(image_file: str | Path) -> str:
    mime_type = get_mimetype(str(image_file))
    with open(image_file, "rb") as f:
        bytes_data = f.read()
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return f"data:{mime_type};base64," + base64_str


def extract_svg_content(image_file: str | Path) -> str:
    """
    Provided a path or URL to an SVG file, return the SVG content as a string.
    Parameters:
        image_file: Local file path or URL to an SVG file
    Returns:
        str: The SVG content as a string
    """
    image_file = str(image_file)
    if is_http_url_like(image_file):
        response = httpx.get(image_file)
        response.raise_for_status()  # Raise an error for bad status codes
        return response.text
    else:
        with open(image_file) as file:
            svg_content = file.read()
        return svg_content


def preprocess_image(
    payload: ImageData | None,
    cache_dir: str,
    format: str,
    image_mode: Literal[
        "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
    ]
    | None,
    type: Literal["numpy", "pil", "filepath"],
) -> np.ndarray | PIL.Image.Image | str | None:
    if payload is None:
        return payload
    if payload.url and payload.url.startswith("data:"):
        if type == "pil":
            return decode_base64_to_image(payload.url)
        elif type == "numpy":
            return decode_base64_to_image_array(payload.url)
        elif type == "filepath":
            return decode_base64_to_file(payload.url, cache_dir, format)
    if payload.path is None:
        raise ValueError("Image path is None.")
    file_path = Path(payload.path)
    if payload.orig_name:
        p = Path(payload.orig_name)
        name = p.stem
        suffix = p.suffix.replace(".", "")
        if suffix in ["jpg", "jpeg"]:
            suffix = "jpeg"
    else:
        name = "image"
        suffix = "webp"

    if suffix.lower() == "svg":
        if type == "filepath":
            return str(file_path)
        raise Error("SVG files are not supported as input images for this app.")

    im = PIL.Image.open(file_path)
    if type == "filepath" and (image_mode in [None, im.mode]):
        return str(file_path)

    exif = im.getexif()
    # 274 is the code for image rotation and 1 means "correct orientation"
    if exif.get(274, 1) != 1 and hasattr(ImageOps, "exif_transpose"):
        try:
            im = ImageOps.exif_transpose(im)
        except Exception:
            warnings.warn(f"Failed to transpose image {file_path} based on EXIF data.")
    if suffix.lower() != "gif" and im is not None:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            if image_mode is not None:
                im = im.convert(image_mode)
    return format_image(
        im,
        type=type,
        cache_dir=cache_dir,
        name=name,
        format=suffix,
    )


def postprocess_image(
    value: np.ndarray | PIL.Image.Image | str | Path | None,
    cache_dir: str,
    format: str,
    watermark: WatermarkOptions | None = None,
) -> ImageData | None:
    """
    Parameters:
        value: Expects a `numpy.array`, `PIL.Image`, or `str` or `pathlib.Path` filepath to an image which is displayed.
        watermark: An optional `WatermarkOptions` instance to apply a watermark to the image.
    Returns:
        Returns the image as a `FileData` object.
    """
    from gradio import Warning

    if value is None:
        return None
    if isinstance(value, str) and value.lower().endswith(".svg"):
        svg_content = extract_svg_content(value)
        if watermark is not None:
            Warning(
                "Watermarking for SVG images is currently not supported. No watermark will be applied."
            )
        return ImageData(
            orig_name=Path(value).name,
            url=f"data:image/svg+xml,{quote(svg_content)}",
        )
    if watermark and watermark.watermark is not None:
        value = add_watermark(value, watermark)
    saved = save_image(value, cache_dir=cache_dir, format=format)
    orig_name = Path(saved).name if Path(saved).exists() else None
    return ImageData(path=saved, orig_name=orig_name)
