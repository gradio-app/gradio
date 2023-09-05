"""gr.Model3D() component."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Callable, Literal

from gradio_client import media_data
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import FileSerializable

from gradio.components.base import IOComponent, _Keywords
from gradio.events import (
    Changeable,
    Clearable,
    Editable,
    Uploadable,
)

set_documentation_group("component")


@document()
class Model3D(
    Changeable, Uploadable, Editable, Clearable, IOComponent, FileSerializable
):
    """
    Component allows users to upload or view 3D Model files (.obj, .glb, or .gltf).
    Preprocessing: This component passes the uploaded file as a {str}filepath.
    Postprocessing: expects function to return a {str} or {pathlib.Path} filepath of type (.obj, glb, or .gltf)

    Demos: model3D
    Guides: how-to-use-3D-model-component
    """

    def __init__(
        self,
        value: str | Callable | None = None,
        *,
        clear_color: tuple[float, float, float, float] | None = None,
        camera_position: tuple[
            int | float | None, int | float | None, int | float | None
        ] = (
            None,
            None,
            None,
        ),
        zoom_speed: float = 1,
        height: int | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        every: float | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: path to (.obj, glb, or .gltf) file to show in model3D viewer. If callable, the function will be called whenever the app loads to set the initial value of the component.
            clear_color: background color of scene, should be a tuple of 4 floats between 0 and 1 representing RGBA values.
            camera_position: initial camera position of scene, provided as a tuple of `(alpha, beta, radius)`. Each value is optional. If provided, `alpha` and `beta` should be in degrees reflecting the angular position along the longitudinal and latitudinal axes, respectively. Radius corresponds to the distance from the center of the object to the camera.
            zoom_speed: the speed of zooming in and out of the scene when the cursor wheel is rotated or when screen is pinched on a mobile device. Should be a positive float, increase this value to make zooming faster, decrease to make it slower. Affects the wheelPrecision property of the camera.
            height: height of the model3D component, in pixels.
            label: component name in interface.
            show_label: if True, will display label.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.clear_color = clear_color or [0, 0, 0, 0]
        self.camera_position = camera_position
        self.height = height
        self.zoom_speed = zoom_speed

        IOComponent.__init__(
            self,
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )

    def get_config(self):
        return {
            "clear_color": self.clear_color,
            "value": self.value,
            "camera_position": self.camera_position,
            "height": self.height,
            "zoom_speed": self.zoom_speed,
            **IOComponent.get_config(self),
        }

    def example_inputs(self) -> dict[str, Any]:
        return {
            "raw": {"is_file": False, "data": media_data.BASE64_MODEL3D},
            "serialized": "https://github.com/gradio-app/gradio/raw/main/test/test_files/Box.gltf",
        }

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        camera_position: tuple[
            int | float | None, int | float | None, int | float | None
        ]
        | None = None,
        clear_color: tuple[float, float, float, float] | None = None,
        height: int | None = None,
        zoom_speed: float | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
    ):
        updated_config = {
            "camera_position": camera_position,
            "clear_color": clear_color,
            "height": height,
            "zoom_speed": zoom_speed,
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }
        return updated_config

    def preprocess(self, x: dict[str, str] | None) -> str | None:
        """
        Parameters:
            x: JSON object with filename as 'name' property and base64 data as 'data' property
        Returns:
            string file path to temporary file with the 3D image model
        """
        if x is None:
            return x
        file_name, file_data, is_file = (
            x["name"],
            x["data"],
            x.get("is_file", False),
        )
        if is_file:
            temp_file_path = self.make_temp_copy_if_needed(file_name)
        else:
            temp_file_path = self.base64_to_temp_file_if_needed(file_data, file_name)

        return temp_file_path

    def postprocess(self, y: str | Path | None) -> dict[str, str] | None:
        """
        Parameters:
            y: path to the model
        Returns:
            file name mapped to base64 url data
        """
        if y is None:
            return y
        data = {
            "name": self.make_temp_copy_if_needed(y),
            "data": None,
            "is_file": True,
        }
        return data

    def as_example(self, input_data: str | None) -> str:
        return Path(input_data).name if input_data else ""
