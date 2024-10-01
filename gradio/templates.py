from __future__ import annotations

from collections.abc import Callable, Iterable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import numpy as np
import PIL.Image

from gradio import components
from gradio.components.audio import WaveformOptions
from gradio.components.image_editor import Brush, Eraser

if TYPE_CHECKING:
    from gradio.components import Timer


class TextArea(components.Textbox):
    """
    Sets: lines=7
    """

    is_template = True

    def __init__(
        self,
        value: str | Callable | None = None,
        *,
        lines: int = 7,
        max_lines: int = 20,
        placeholder: str | None = None,
        label: str | None = None,
        info: str | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        autofocus: bool = False,
        autoscroll: bool = True,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        type: Literal["text", "password", "email"] = "text",
        text_align: Literal["left", "right"] | None = None,
        rtl: bool = False,
        show_copy_button: bool = False,
        max_length: int | None = None,
        submit_btn: str | bool | None = False,
        stop_btn: str | bool | None = False,
    ):
        super().__init__(
            value=value,
            lines=lines,
            max_lines=max_lines,
            placeholder=placeholder,
            label=label,
            info=info,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            autofocus=autofocus,
            autoscroll=autoscroll,
            elem_classes=elem_classes,
            render=render,
            key=key,
            type=type,
            text_align=text_align,
            rtl=rtl,
            show_copy_button=show_copy_button,
            max_length=max_length,
            submit_btn=submit_btn,
            stop_btn=stop_btn,
        )


class Sketchpad(components.ImageEditor):
    """
    Sets: sources=(), brush=Brush(colors=["#000000"], color_mode="fixed")
    """

    is_template = True

    def __init__(
        self,
        value: str | PIL.Image.Image | np.ndarray | None = None,
        *,
        height: int | str | None = None,
        width: int | str | None = None,
        image_mode: Literal[
            "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
        ] = "RGBA",
        sources: Iterable[Literal["upload", "webcam", "clipboard"]] = (),
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
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
        key: int | str | None = None,
        placeholder: str | None = None,
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = None,
        transforms: Iterable[Literal["crop"]] = ("crop",),
        eraser: Eraser | None = None,
        brush: Brush | None = None,
        format: str = "webp",
        layers: bool = True,
        canvas_size: tuple[int, int] | None = None,
        show_fullscreen_button: bool = True,
    ):
        if not brush:
            brush = Brush(colors=["#000000"], color_mode="fixed")
        super().__init__(
            value=value,
            height=height,
            width=width,
            image_mode=image_mode,
            sources=sources,
            type=type,
            label=label,
            every=every,
            inputs=inputs,
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
            key=key,
            placeholder=placeholder,
            mirror_webcam=mirror_webcam,
            show_share_button=show_share_button,
            _selectable=_selectable,
            crop_size=crop_size,
            transforms=transforms,
            eraser=eraser,
            brush=brush,
            format=format,
            layers=layers,
            canvas_size=canvas_size,
            show_fullscreen_button=show_fullscreen_button,
        )


class Paint(components.ImageEditor):
    """
    Sets: sources=()
    """

    is_template = True

    def __init__(
        self,
        value: str | PIL.Image.Image | np.ndarray | None = None,
        *,
        height: int | str | None = None,
        width: int | str | None = None,
        image_mode: Literal[
            "1", "L", "P", "RGB", "RGBA", "CMYK", "YCbCr", "LAB", "HSV", "I", "F"
        ] = "RGBA",
        sources: Iterable[Literal["upload", "webcam", "clipboard"]] = (),
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
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
        key: int | str | None = None,
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = None,
        transforms: Iterable[Literal["crop"]] = ("crop",),
        eraser: Eraser | None = None,
        brush: Brush | None = None,
        format: str = "webp",
        layers: bool = True,
        canvas_size: tuple[int, int] | None = None,
        show_fullscreen_button: bool = True,
        placeholder: str | None = None,
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
            inputs=inputs,
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
            key=key,
            mirror_webcam=mirror_webcam,
            show_share_button=show_share_button,
            _selectable=_selectable,
            crop_size=crop_size,
            transforms=transforms,
            eraser=eraser,
            brush=brush,
            format=format,
            layers=layers,
            canvas_size=canvas_size,
            show_fullscreen_button=show_fullscreen_button,
            placeholder=placeholder,
        )


class ImageMask(components.ImageEditor):
    """
    Sets: brush=Brush(colors=["#000000"], color_mode="fixed")
    """

    is_template = True

    def __init__(
        self,
        value: str | PIL.Image.Image | np.ndarray | None = None,
        *,
        height: int | str | None = None,
        width: int | str | None = None,
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
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
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
        key: int | str | None = None,
        placeholder: str | None = None,
        mirror_webcam: bool = True,
        show_share_button: bool | None = None,
        _selectable: bool = False,
        crop_size: tuple[int | float, int | float] | str | None = None,
        transforms: Iterable[Literal["crop"]] = ("crop",),
        eraser: Eraser | None = None,
        brush: Brush | None = None,
        format: str = "webp",
        layers: bool = True,
        canvas_size: tuple[int, int] | None = None,
        show_fullscreen_button: bool = True,
    ):
        if not brush:
            brush = Brush(colors=["#000000"], color_mode="fixed")
        super().__init__(
            value=value,
            height=height,
            width=width,
            image_mode=image_mode,
            sources=sources,
            type=type,
            label=label,
            every=every,
            inputs=inputs,
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
            key=key,
            placeholder=placeholder,
            mirror_webcam=mirror_webcam,
            show_share_button=show_share_button,
            _selectable=_selectable,
            crop_size=crop_size,
            transforms=transforms,
            eraser=eraser,
            brush=brush,
            format=format,
            layers=layers,
            canvas_size=canvas_size,
            show_fullscreen_button=show_fullscreen_button,
        )


class PlayableVideo(components.Video):
    """
    Sets: format="mp4"
    """

    is_template = True

    def __init__(
        self,
        value: (
            str | Path | tuple[str | Path, str | Path | None] | Callable | None
        ) = None,
        *,
        format: Literal["mp4"] = "mp4",
        sources: list[Literal["upload", "webcam"]]
        | Literal["upload", "webcam"]
        | None = None,
        height: int | str | None = None,
        width: int | str | None = None,
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        mirror_webcam: bool = True,
        include_audio: bool | None = None,
        autoplay: bool = False,
        show_share_button: bool | None = None,
        show_download_button: bool | None = None,
        min_length: int | None = None,
        max_length: int | None = None,
        loop: bool = False,
        streaming: bool = False,
        watermark: str | Path | None = None,
    ):
        sources = ["upload"]
        super().__init__(
            value=value,
            format=format,
            sources=sources,  # type: ignore
            height=height,
            width=width,
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            mirror_webcam=mirror_webcam,
            include_audio=include_audio,
            autoplay=autoplay,
            show_share_button=show_share_button,
            show_download_button=show_download_button,
            min_length=min_length,
            max_length=max_length,
            loop=loop,
            streaming=streaming,
            watermark=watermark,
        )


class Microphone(components.Audio):
    """
    Sets: sources=["microphone"]
    """

    is_template = True

    def __init__(
        self,
        value: str | Path | tuple[int, np.ndarray] | Callable | None = None,
        *,
        sources: list[Literal["upload", "microphone"]]
        | Literal["upload", "microphone"]
        | None = None,
        type: Literal["numpy", "filepath"] = "numpy",
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        format: Literal["wav", "mp3"] = "wav",
        autoplay: bool = False,
        show_download_button: bool | None = None,
        show_share_button: bool | None = None,
        editable: bool = True,
        min_length: int | None = None,
        max_length: int | None = None,
        waveform_options: WaveformOptions | dict | None = None,
        loop: bool = False,
        recording: bool = False,
    ):
        sources = ["microphone"]
        super().__init__(
            value,
            sources=sources,
            type=type,
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            format=format,
            autoplay=autoplay,
            show_download_button=show_download_button,
            show_share_button=show_share_button,
            editable=editable,
            min_length=min_length,
            max_length=max_length,
            waveform_options=waveform_options,
            loop=loop,
            recording=recording,
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
        file_types: list[str] | None = None,
        type: Literal["filepath", "binary"] = "filepath",
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        height: int | float | None = None,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
    ):
        super().__init__(
            value,
            file_count=file_count,
            file_types=file_types,
            type=type,
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            height=height,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
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
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
        max_height: int = 500,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        wrap: bool = False,
        line_breaks: bool = True,
        column_widths: list[str | int] | None = None,
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
            elem_classes=elem_classes,
            render=render,
            key=key,
            line_breaks=line_breaks,
            column_widths=column_widths,
            every=every,
            inputs=inputs,
            max_height=max_height,
            scale=scale,
            latex_delimiters=latex_delimiters,
            min_width=min_width,
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
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
        max_height: int = 500,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        wrap: bool = False,
        line_breaks: bool = True,
        column_widths: list[str | int] | None = None,
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
            elem_classes=elem_classes,
            render=render,
            key=key,
            line_breaks=line_breaks,
            column_widths=column_widths,
            every=every,
            inputs=inputs,
            max_height=max_height,
            scale=scale,
            latex_delimiters=latex_delimiters,
            min_width=min_width,
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
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        every: Timer | float | None = None,
        inputs: components.Component
        | Sequence[components.Component]
        | set[components.Component]
        | None = None,
        max_height: int = 500,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        wrap: bool = False,
        line_breaks: bool = True,
        column_widths: list[str | int] | None = None,
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
            elem_classes=elem_classes,
            render=render,
            key=key,
            line_breaks=line_breaks,
            column_widths=column_widths,
            every=every,
            inputs=inputs,
            max_height=max_height,
            scale=scale,
            latex_delimiters=latex_delimiters,
            min_width=min_width,
        )


Mic = Microphone
