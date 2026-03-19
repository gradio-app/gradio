"""gr.RobotViewer() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Literal

from gradio_client import handle_file
from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.components.button import Button
from gradio.data_classes import FileData
from gradio.events import Events
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class RobotViewer(Component):
    """
    Creates a component that allows users to upload and view articulated robot models
    in URDF or MJCF format, with support for real-time joint state updates.
    """

    EVENTS = [Events.change, Events.upload, Events.clear]

    data_model = FileData

    def __init__(
        self,
        value: str | Callable | None = None,
        *,
        joint_states: dict[str, float] | None = None,
        clear_color: tuple[float, float, float, float] | None = None,
        camera_position: tuple[
            int | float | None, int | float | None, int | float | None
        ] = (
            None,
            None,
            None,
        ),
        zoom_speed: float = 1,
        pan_speed: float = 1,
        height: int | str | None = None,
        show_joint_names: bool = False,
        label: str | I18nData | None = None,
        show_label: bool | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
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
        buttons: list[Button] | None = None,
    ):
        """
        Parameters:
            value: path to (.urdf, .xml, or .mjcf) robot description file to show in the viewer. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            joint_states: a dictionary mapping joint names to radian values for setting joint positions.
            clear_color: background color of scene, should be a tuple of 4 floats between 0 and 1 representing RGBA values.
            camera_position: initial camera position of scene, provided as a tuple of `(x, y, z)`. Each value is optional.
            zoom_speed: the speed of zooming in and out of the scene. Should be a positive float.
            pan_speed: the speed of panning the scene. Should be a positive float.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed.
            show_joint_names: if True, display joint name labels in the 3D view.
            label: the label for this component.
            show_label: if True, will display label.
            every: Continuously calls `value` to recalculate it if `value` is a function. Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function.
            container: If True, will place the component in a container.
            scale: relative size compared to adjacent Components.
            min_width: minimum pixel width.
            interactive: if True, will allow users to upload a file; if False, can only be used to display files.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM.
            render: If False, component will not be rendered in the Blocks context.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component.
            preserved_by_key: A list of parameters from this component's constructor to preserve across re-renders.
            buttons: A list of gr.Button() instances to show in the top right corner of the component.
        """
        self.joint_states = joint_states
        self.clear_color = clear_color or [0, 0, 0, 0]
        self.camera_position = camera_position
        self.height = height
        self.zoom_speed = zoom_speed
        self.pan_speed = pan_speed
        self.show_joint_names = show_joint_names
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
        self.buttons = set_default_buttons(buttons, None)
        self._value_description = (
            "a string path to a (.urdf, .xml, or .mjcf) robot description file."
        )

    def preprocess(self, payload: FileData | None) -> str | None:
        """
        Parameters:
            payload: the uploaded file as an instance of `FileData`.
        Returns:
            Passes the uploaded file as a {str} filepath to the function.
        """
        if payload is None:
            return payload
        return payload.path

    def postprocess(self, value: str | Path | None) -> FileData | None:
        """
        Parameters:
            value: Expects function to return a {str} or {pathlib.Path} filepath of type (.urdf, .xml, or .mjcf)
        Returns:
            The uploaded file as an instance of `FileData`.
        """
        if value is None:
            return value
        return FileData(path=str(value), orig_name=Path(value).name)

    def process_example(self, value: str | Path | None) -> str:
        return Path(value).name if value else ""

    def example_payload(self):
        return handle_file(
            "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/media_assets/models3d/Fox.gltf"
        )

    def example_value(self):
        return "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/media_assets/models3d/Fox.gltf"
