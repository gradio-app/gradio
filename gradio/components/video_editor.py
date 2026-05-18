"""gr.VideoEditor() component."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal, Sequence

import numpy as np
import PIL.Image
from gradio_client import handle_file
from gradio_client.documentation import document

from gradio import image_utils
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


class VideoEditorData(GradioModel):
    video: FileData
    mask: FileData | None = None


@document()
class VideoEditor(Component):
    """
    Creates a video editor component that allows users to upload a video and draw a mask
    on top of the displayed frame. The mask is returned as a PNG image alongside the
    uploaded video. If the browser cannot play the uploaded video, an error message is
    shown in place of the player.

    Demos: video_editor_mask
    """

    EVENTS = [
        Events.change,
        Events.upload,
        Events.clear,
    ]

    data_model = VideoEditorData

    def __init__(
        self,
        value: str | Path | None = None,
        *,
        sources: list[Literal["upload"]] | None = None,
        height: int | str | None = None,
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        brush_color: str = "rgba(255, 0, 0, 0.5)",
        brush_size: int = 20,
    ):
        """
        Parameters:
            value: path or URL for the default video to display.
            sources: list of sources permitted. Currently only "upload" is supported.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload a video and draw a mask; if False, can only be used to display videos. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            brush_color: default color of the mask brush, in any valid CSS color string.
            brush_size: default brush size in pixels.
        """
        self.sources = sources or ["upload"]
        self.height = height
        self.brush_color = brush_color
        self.brush_size = brush_size

        super().__init__(
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
            preserved_by_key=preserved_by_key,
            value=value,
        )

    def preprocess(self, payload: VideoEditorData | None) -> dict | None:
        """
        Parameters:
            payload: a VideoEditorData object with the uploaded video and optional drawn mask.
        Returns:
            A dict with keys "video" (str path to the uploaded video) and "mask" (numpy array of the drawn mask in RGBA, or None).
        """
        if payload is None:
            return None

        mask_arr = None
        if payload.mask:
            try:
                mask_img = PIL.Image.open(payload.mask.path).convert("RGBA")
            except (PIL.UnidentifiedImageError, OSError) as e:
                raise Error(f"Could not read mask image: {e}") from e
            mask_arr = np.array(mask_img)

        return {"video": payload.video.path, "mask": mask_arr}

    def postprocess(self, value: dict | str | Path | None) -> VideoEditorData | None:
        """
        Parameters:
            value: either a path/URL to a video, or a dict with keys "video" and "mask".
                The mask can be a numpy array, PIL Image, or file path.
        Returns:
            A VideoEditorData object suitable for the frontend.
        """
        if value is None:
            return None

        if isinstance(value, (str, Path)):
            return VideoEditorData(video=FileData(path=str(value)))

        video_path = value.get("video")
        if not video_path:
            return None

        video_fd = FileData(path=str(video_path))
        mask_fd: FileData | None = None

        mask = value.get("mask")
        if mask is not None:
            if isinstance(mask, (str, Path)):
                mask_fd = FileData(path=str(mask))
            else:
                mask_path = image_utils.save_image(
                    mask, self.GRADIO_CACHE, format="png"
                )
                mask_fd = FileData(path=mask_path)

        return VideoEditorData(video=video_fd, mask=mask_fd)

    def example_payload(self) -> Any:
        return {
            "video": handle_file(
                "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/videos/world.mp4"
            ),
            "mask": None,
        }

    def example_value(self) -> Any:
        return {
            "video": "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/videos/world.mp4",
            "mask": None,
        }
