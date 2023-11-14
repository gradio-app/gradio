"""gr.Model3D() component."""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import Component
from gradio.data_classes import FileData
from gradio.events import Events

set_documentation_group("component")


@document()
class Model3D(Component):
    """
    Component allows users to upload or view 3D Model files (.obj, .glb, or .gltf).
    Preprocessing: This component passes the uploaded file as a {str}filepath.
    Postprocessing: expects function to return a {str} or {pathlib.Path} filepath of type (.obj, glb, or .gltf)

    Demos: model3D
    Guides: how-to-use-3D-model-component
    """

    EVENTS = [Events.change, Events.upload, Events.edit, Events.clear]

    data_model = FileData

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
        pan_speed: float = 1,
        height: int | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        every: float | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
    ):
        """
        Parameters:
            value: path to (.obj, glb, or .gltf) file to show in model3D viewer. If callable, the function will be called whenever the app loads to set the initial value of the component.
            clear_color: background color of scene, should be a tuple of 4 floats between 0 and 1 representing RGBA values.
            camera_position: initial camera position of scene, provided as a tuple of `(alpha, beta, radius)`. Each value is optional. If provided, `alpha` and `beta` should be in degrees reflecting the angular position along the longitudinal and latitudinal axes, respectively. Radius corresponds to the distance from the center of the object to the camera.
            zoom_speed: the speed of zooming in and out of the scene when the cursor wheel is rotated or when screen is pinched on a mobile device. Should be a positive float, increase this value to make zooming faster, decrease to make it slower. Affects the wheelPrecision property of the camera.
            pan_speed: the speed of panning the scene when the cursor is dragged or when the screen is dragged on a mobile device. Should be a positive float, increase this value to make panning faster, decrease to make it slower. Affects the panSensibility property of the camera.
            height: height of the model3D component, in pixels.
            interactive: if True, will allow users to upload a file; if False, can only be used to display files. If not provided, this is inferred based on whether the component is used as an input or output.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            show_label: if True, will display label.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
        """
        self.clear_color = clear_color or [0, 0, 0, 0]
        self.camera_position = camera_position
        self.height = height
        self.zoom_speed = zoom_speed
        self.pan_speed = pan_speed
        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            value=value,
        )

    def preprocess(self, payload: FileData | None) -> str | None:
        if payload is None:
            return payload
        return payload.path

    def postprocess(self, value: str | Path | None) -> FileData | None:
        if value is None:
            return value
        return FileData(path=str(value), orig_name=Path(value).name)

    def as_example(self, input_data: str | None) -> str:
        return Path(input_data).name if input_data else ""

    def example_inputs(self):
        # TODO: Use permanent link
        return "https://raw.githubusercontent.com/gradio-app/gradio/main/demo/model3D/files/Fox.gltf"
