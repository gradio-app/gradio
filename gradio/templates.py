from __future__ import annotations

from typing import Any, Callable, Literal

import numpy as np
from PIL.Image import Image

from gradio import components


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


class Webcam(components.Image):
    """
    Sets: source="webcam", interactive=True
    """

    is_template = True

    def __init__(
        self,
        value: str | Image | np.ndarray | None = None,
        *,
        shape: tuple[int, int] | None = None,
        image_mode: Literal["RGB", "L"] = "RGB",
        invert_colors: bool = False,
        source: Literal["webcam"] = "webcam",
        tool: Literal["editor", "select", "sketch", "color-sketch"] | None = None,
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = True,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        mirror_webcam: bool = True,
        brush_radius: float | None = None,
        brush_color: str = "#000000",
        **kwargs,
    ):
        super().__init__(
            value=value,
            shape=shape,
            image_mode=image_mode,
            invert_colors=invert_colors,
            source=source,
            tool=tool,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            mirror_webcam=mirror_webcam,
            brush_radius=brush_radius,
            brush_color=brush_color,
            **kwargs,
        )


class Sketchpad(components.Image):
    """
    Sets: image_mode="L", source="canvas", shape=(28, 28), invert_colors=True, interactive=True
    """

    is_template = True

    def __init__(
        self,
        value: str | Image | np.ndarray | None = None,
        *,
        shape: tuple[int, int] = (28, 28),
        image_mode: Literal["L"] = "L",
        invert_colors: bool = True,
        source: Literal["canvas"] = "canvas",
        tool: Literal["editor", "select", "sketch", "color-sketch"] | None = None,
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = True,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        mirror_webcam: bool = True,
        brush_radius: float | None = None,
        brush_color: str = "#000000",
        **kwargs,
    ):
        super().__init__(
            value=value,
            shape=shape,
            image_mode=image_mode,
            invert_colors=invert_colors,
            source=source,
            tool=tool,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            mirror_webcam=mirror_webcam,
            brush_radius=brush_radius,
            brush_color=brush_color,
            **kwargs,
        )


class Paint(components.Image):
    """
    Sets: source="canvas", tool="color-sketch", interactive=True
    """

    is_template = True

    def __init__(
        self,
        value: str | Image | np.ndarray | None = None,
        *,
        shape: tuple[int, int] | None = None,
        image_mode: Literal["RGB"] = "RGB",
        invert_colors: bool = False,
        source: Literal["canvas"] = "canvas",
        tool: Literal["color-sketch"] = "color-sketch",
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = True,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        mirror_webcam: bool = True,
        brush_radius: float | None = None,
        brush_color: str = "#000000",
        **kwargs,
    ):
        super().__init__(
            value=value,
            shape=shape,
            image_mode=image_mode,
            invert_colors=invert_colors,
            source=source,
            tool=tool,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            mirror_webcam=mirror_webcam,
            brush_radius=brush_radius,
            brush_color=brush_color,
            **kwargs,
        )


class ImageMask(components.Image):
    """
    Sets: source="upload", tool="sketch", interactive=True
    """

    is_template = True

    def __init__(
        self,
        value: str | Image | np.ndarray | None = None,
        *,
        shape: tuple[int, int] | None = None,
        image_mode: Literal["RGB", "L"] = "RGB",
        invert_colors: bool = False,
        source: Literal["upload"] = "upload",
        tool: Literal["sketch"] = "sketch",
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = True,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        mirror_webcam: bool = True,
        brush_radius: float | None = None,
        brush_color: str = "#000000",
        **kwargs,
    ):
        super().__init__(
            value=value,
            shape=shape,
            image_mode=image_mode,
            invert_colors=invert_colors,
            source=source,
            tool=tool,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            mirror_webcam=mirror_webcam,
            brush_radius=brush_radius,
            brush_color=brush_color,
            **kwargs,
        )


class ImagePaint(components.Image):
    """
    Sets: source="upload", tool="color-sketch", interactive=True
    """

    is_template = True

    def __init__(
        self,
        value: str | Image | np.ndarray | None = None,
        *,
        shape: tuple[int, int] | None = None,
        image_mode: Literal["RGB", "L"] = "RGB",
        invert_colors: bool = False,
        source: Literal["upload"] = "upload",
        tool: Literal["color-sketch"] = "color-sketch",
        type: Literal["numpy", "pil", "filepath"] = "numpy",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = True,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        mirror_webcam: bool = True,
        brush_radius: float | None = None,
        brush_color: str = "#000000",
        **kwargs,
    ):
        super().__init__(
            value=value,
            shape=shape,
            image_mode=image_mode,
            invert_colors=invert_colors,
            source=source,
            tool=tool,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            mirror_webcam=mirror_webcam,
            brush_radius=brush_radius,
            brush_color=brush_color,
            **kwargs,
        )


class Pil(components.Image):
    """
    Sets: type="pil"
    """

    is_template = True

    def __init__(
        self,
        value: str | Image | np.ndarray | None = None,
        *,
        shape: tuple[int, int] | None = None,
        image_mode: Literal["RGB", "L"] = "RGB",
        invert_colors: bool = False,
        source: Literal["upload", "webcam", "canvas"] = "upload",
        tool: Literal["editor", "select", "sketch", "color-sketch"] | None = None,
        type: Literal["pil"] = "pil",
        label: str | None = None,
        show_label: bool = True,
        interactive: bool | None = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        mirror_webcam: bool = True,
        brush_radius: float | None = None,
        brush_color: str = "#000000",
        **kwargs,
    ):
        super().__init__(
            value=value,
            shape=shape,
            image_mode=image_mode,
            invert_colors=invert_colors,
            source=source,
            tool=tool,
            type=type,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            streaming=streaming,
            elem_id=elem_id,
            mirror_webcam=mirror_webcam,
            brush_radius=brush_radius,
            brush_color=brush_color,
            **kwargs,
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
        source: Literal["upload", "webcam"] = "upload",
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
            source=source,
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
    Sets: source="microphone"
    """

    is_template = True

    def __init__(
        self,
        value: str | tuple[int, np.ndarray] | Callable | None = None,
        *,
        source: Literal["microphone"] = "microphone",
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
            source=source,
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
        type: Literal["file", "binary"] = "file",
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
        max_rows: int | None = 20,
        max_cols: int | None = None,
        overflow_row_behaviour: Literal["paginate", "show_ends"] = "paginate",
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
            max_rows=max_rows,
            max_cols=max_cols,
            overflow_row_behaviour=overflow_row_behaviour,
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
        max_rows: int | None = 20,
        max_cols: int | None = None,
        overflow_row_behaviour: Literal["paginate", "show_ends"] = "paginate",
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
            max_rows=max_rows,
            max_cols=max_cols,
            overflow_row_behaviour=overflow_row_behaviour,
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
        max_rows: int | None = 20,
        max_cols: int | None = None,
        overflow_row_behaviour: Literal["paginate", "show_ends"] = "paginate",
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
            max_rows=max_rows,
            max_cols=max_cols,
            overflow_row_behaviour=overflow_row_behaviour,
            label=label,
            show_label=show_label,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            wrap=wrap,
            **kwargs,
        )


Mic = Microphone
