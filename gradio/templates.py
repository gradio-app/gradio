from __future__ import annotations

from typing import Any, Callable, Iterable, Literal

import numpy as np
from PIL import Image as _Image  # using _ to minimize namespace pollution

from gradio import components
from gradio.components.image_editor import Brush, Eraser


class TextArea(components.Textbox):
    """
    Sets: lines=7
    """

    is_template = True

    def __init__(
        self,
        value: str | Callable | None = "",
        *,
        lines: int = 7,
        max_lines: int = 20,
        placeholder: str | None = None,
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        **kwargs,
    ):
        super().__init__(
            value=value,
            lines=lines,
            max_lines=max_lines,
            placeholder=placeholder,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )


class Sketchpad(components.ImageEditor):
    """
    Sets: image_mode="L", sources=(), crop_size=(28, 28), brush=Brush(colors=["#000000"])
    """

    is_template = True

    def __init__(
        self,
        value: str | _Image.Image | np.ndarray | None = None,
        *,
        height: int | None = None,
        width: int | None = None,
        image_mode: Literal[
            "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
        ] = "L",
        sources: Iterable[Literal["upload", "webcam", "clipboard"]] = (),
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        show_download_button: bool = True,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = (28, 28),
        transforms: Iterable[Literal["crop"]] = ("crop",),
        eraser: Eraser | None = None,
        brush: Brush | None = None,
    ):
        if not brush:
            brush = Brush(colors=["#000000"])
        super().__init__(
            value=value,
            height=height,
            width=width,
            image_mode=image_mode,
            sources=sources,
            type=type,
            label=label,
            every=every,
            show_label=show_label,
            show_download_button=show_download_button,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            mirror_webcam=mirror_webcam,
            show_share_button=show_share_button,
            _selectable=_selectable,
            crop_size=crop_size,
            transforms=transforms,
            eraser=eraser,
            brush=brush,
        )


class Paint(components.ImageEditor):
    """
    Sets: sources=()
    """

    is_template = True

    def __init__(
        self,
        value: str | _Image.Image | np.ndarray | None = None,
        *,
        height: int | None = None,
        width: int | None = None,
        image_mode: Literal[
            "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
        ] = "RGBA",
        sources: Iterable[Literal["upload", "webcam", "clipboard"]] = (),
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        show_download_button: bool = True,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = None,
        transforms: Iterable[Literal["crop"]] = ("crop",),
        eraser: Eraser | None = None,
        brush: Brush | None = None,
    ):
        super().__init__(
            value=value,
            height=height,
            width=width,
            image_mode=image_mode,
            sources=sources,
            type=type,
            label=label,
            every=every,
            show_label=show_label,
            show_download_button=show_download_button,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            mirror_webcam=mirror_webcam,
            show_share_button=show_share_button,
            _selectable=_selectable,
            crop_size=crop_size,
            transforms=transforms,
            eraser=eraser,
            brush=brush,
        )


class ImageMask(components.ImageEditor):
    """
    Sets:
    """

    is_template = True

    def __init__(
        self,
        value: str | _Image.Image | np.ndarray | None = None,
        *,
        height: int | None = None,
        width: int | None = None,
        image_mode: Literal[
            "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
        ] = "RGBA",
        sources: Iterable[Literal["upload", "webcam", "clipboard"]] = (
            "upload",
            "webcam",
            "clipboard",
        ),
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        show_download_button: bool = True,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = None,
        transforms: Iterable[Literal["crop"]] = ("crop",),
        eraser: Eraser | None = None,
        brush: Brush | None = None,
    ):
        if not brush:
            brush = Brush(colors=["#000000"])
        super().__init__(
            value=value,
            height=height,
            width=width,
            image_mode=image_mode,
            sources=sources,
            type=type,
            label=label,
            every=every,
            show_label=show_label,
            show_download_button=show_download_button,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            mirror_webcam=mirror_webcam,
            show_share_button=show_share_button,
            _selectable=_selectable,
            crop_size=crop_size,
            transforms=transforms,
            eraser=eraser,
            brush=brush,
        )


class PlayableVideo(components.Video):
    """
    Sets: format="mp4"
    """

    is_template = True

    def __init__(
        self,
        value: str | Callable | None = None,
        *,
        format: Literal["mp4"] | None = "mp4",
        sources: list[Literal["upload", "webcam"]] = ["upload"],  # noqa: B006
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        mirror_webcam: bool = True,
        include_audio: bool | None = None,
        **kwargs,
    ):
        super().__init__(
            value=value,
            format=format,
            sources=sources,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            mirror_webcam=mirror_webcam,
            include_audio=include_audio,
            **kwargs,
        )


class Microphone(components.Audio):
    """
    Sets: sources=["microphone"]
    """

    is_template = True

    def __init__(
        self,
        value: str | tuple[int, np.ndarray] | Callable | None = None,
        *,
        sources: list[Literal["upload", "microphone"]]
        | None = ["microphone"],  # noqa: B006
        type: Literal["numpy", "filepath"] = "numpy",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        **kwargs,
    ):
        super().__init__(
            value=value,
            sources=sources,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            **kwargs,
        )


class Files(components.File):
    """
    Sets: file_count="multiple"
    """

    is_template = True

    def __init__(
        self,
        value: str | list[str] | Callable | None = None,
        *,
        file_count: Literal["multiple"] = "multiple",
        type: Literal["filepath", "binary"] = "filepath",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        **kwargs,
    ):
        super().__init__(
            value=value,
            file_count=file_count,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            **kwargs,
        )


class Numpy(components.Dataframe):
    """
    Sets: type="numpy"
    """

    is_template = True

    def __init__(
        self,
        value: list[list[Any]] | Callable | None = None,
        *,
        headers: list[str] | None = None,
        row_count: int | tuple[int, str] = (1, "dynamic"),
        col_count: int | tuple[int, str] | None = None,
        datatype: str | list[str] = "str",
        type: Literal["numpy"] = "numpy",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        wrap: bool = False,
        **kwargs,
    ):
        super().__init__(
            value=value,
            headers=headers,
            row_count=row_count,
            col_count=col_count,
            datatype=datatype,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            wrap=wrap,
            **kwargs,
        )


class Matrix(components.Dataframe):
    """
    Sets: type="array"
    """

    is_template = True

    def __init__(
        self,
        value: list[list[Any]] | Callable | None = None,
        *,
        headers: list[str] | None = None,
        row_count: int | tuple[int, str] = (1, "dynamic"),
        col_count: int | tuple[int, str] | None = None,
        datatype: str | list[str] = "str",
        type: Literal["array"] = "array",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        wrap: bool = False,
        **kwargs,
    ):
        super().__init__(
            value=value,
            headers=headers,
            row_count=row_count,
            col_count=col_count,
            datatype=datatype,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            wrap=wrap,
            **kwargs,
        )


class List(components.Dataframe):
    """
    Sets: type="array", col_count=1
    """

    is_template = True

    def __init__(
        self,
        value: list[list[Any]] | Callable | None = None,
        *,
        headers: list[str] | None = None,
        row_count: int | tuple[int, str] = (1, "dynamic"),
        col_count: Literal[1] = 1,
        datatype: str | list[str] = "str",
        type: Literal["array"] = "array",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        wrap: bool = False,
        **kwargs,
    ):
        super().__init__(
            value=value,
            headers=headers,
            row_count=row_count,
            col_count=col_count,
            datatype=datatype,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            wrap=wrap,
            **kwargs,
        )


Mic = Microphone
