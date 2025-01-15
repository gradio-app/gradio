"""gr.Model3D() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Literal

from gradio_client import handle_file
from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.data_classes import FileData
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class Model3D(Component):
    """
    Creates a component allows users to upload or view 3D Model files (.obj, .glb, .stl, .gltf, .splat, or .ply).

    Guides: how-to-use-3D-model-component
    """

    EVENTS = [Events.change, Events.upload, Events.edit, Events.clear]

    data_model = FileData

    def __init__(
        self,
        value: str | Callable | None = None,
        *,
        display_mode: Literal["solid", "point_cloud", "wireframe"] | None = None,
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
        label: str | None = None,
        show_label: bool | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
    ):
        """
        Parameters:
            value: path to (.obj, .glb, .stl, .gltf, .splat, or .ply) file to show in model3D viewer. If callable, the function will be called whenever the app loads to set the initial value of the component.
            display_mode: the display mode of the 3D model in the scene. Can be "solid" (which renders the model as a solid object), "point_cloud", or "wireframe". For .splat, or .ply files, this parameter is ignored, as those files can only be rendered as solid objects.
            clear_color: background color of scene, should be a tuple of 4 floats between 0 and 1 representing RGBA values.
            camera_position: initial camera position of scene, provided as a tuple of `(alpha, beta, radius)`. Each value is optional. If provided, `alpha` and `beta` should be in degrees reflecting the angular position along the longitudinal and latitudinal axes, respectively. Radius corresponds to the distance from the center of the object to the camera.
            zoom_speed: the speed of zooming in and out of the scene when the cursor wheel is rotated or when screen is pinched on a mobile device. Should be a positive float, increase this value to make zooming faster, decrease to make it slower. Affects the wheelPrecision property of the camera.
            pan_speed: the speed of panning the scene when the cursor is dragged or when the screen is dragged on a mobile device. Should be a positive float, increase this value to make panning faster, decrease to make it slower. Affects the panSensibility property of the camera.
            height: The height of the model3D component, specified in pixels if a number is passed, or in CSS units if a string is passed.
            interactive: if True, will allow users to upload a file; if False, can only be used to display files. If not provided, this is inferred based on whether the component is used as an input or output.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            show_label: if True, will display label.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
        """
        self.display_mode = display_mode
        self.clear_color = clear_color or [0, 0, 0, 0]
        self.camera_position = camera_position
        self.height = height
        self.zoom_speed = zoom_speed
        self.pan_speed = pan_speed
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
            value=value,
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
            value: Expects function to return a {str} or {pathlib.Path} filepath of type (.obj, .glb, .stl, or .gltf)
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
            "https://raw.githubusercontent.com/gradio-app/gradio/main/demo/model3D/files/Fox.gltf"
        )

    def example_value(self):
        return "https://raw.githubusercontent.com/gradio-app/gradio/main/demo/model3D/files/Fox.gltf"
