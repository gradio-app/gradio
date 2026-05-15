"""gr.Timeline() component."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class Timeline(Component):
    """
    Creates a timeline component for displaying events in chronological order.
    Each event can have a title, description, timestamp, and status indicator.
    """

    EVENTS = [Events.click, Events.select]

    def __init__(
        self,
        value: list[dict[str, Any]] | None = None,
        *,
        layout: Literal["vertical", "horizontal"] = "vertical",
        label: str | None = None,
        info: str | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
    ):
        """
        Parameters:
            value: List of event dictionaries. Each event can have: title (str, required), description (str), timestamp (str), status (str: "completed", "in-progress", "pending", "error"), icon (str), color (str).
            layout: Layout direction of the timeline. Can be "vertical" (default) or "horizontal".
            label: the label for this component, displayed above the component in the gradio interface.
            info: additional component description, appears below the label in the gradio interface.
            show_label: if True, will display label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value.
            interactive: if True, events like click and select will be triggered; if False, the timeline is read-only.
            visible: if False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM.
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: an optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
        """
        self.layout = layout
        super().__init__(
            label=label,
            info=info,
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
            every=every,
            inputs=inputs,
        )

    def preprocess(self, payload: list[dict[str, Any]] | None) -> list[dict[str, Any]] | None:
        """
        Parameters:
            payload: List of event dictionaries as received from the frontend when an event is triggered.
        Returns:
            The list of event dictionaries to be passed to the user's function.
        """
        return payload

    def postprocess(self, value: list[dict[str, Any]] | None) -> list[dict[str, Any]] | None:
        """
        Parameters:
            value: List of event dictionaries to display in the timeline.
        Returns:
            The processed list of event dictionaries to be sent to the frontend.
        """
        if value is None:
            return None
        return value

    def process_example(self, value: list[dict[str, Any]] | None) -> str:
        """
        Process the input data for display in the examples dataset.
        """
        if value is None:
            return ""
        if isinstance(value, list) and len(value) > 0:
            return f"{len(value)} events"
        return ""

    def example_payload(self) -> Any:
        return [
            {
                "title": "Start Training",
                "timestamp": "10:00",
                "status": "completed",
            },
            {
                "title": "Epoch 10",
                "timestamp": "10:30",
                "status": "in-progress",
            },
        ]

    def example_value(self) -> Any:
        return [
            {
                "title": "Start Training",
                "timestamp": "10:00",
                "status": "completed",
            },
            {
                "title": "Epoch 10",
                "timestamp": "10:30",
                "status": "in-progress",
            },
        ]

    def api_info(self) -> dict[str, Any]:
        return {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "timestamp": {"type": "string"},
                    "status": {
                        "type": "string",
                        "enum": ["completed", "in-progress", "pending", "error"],
                    },
                    "icon": {"type": "string"},
                    "color": {"type": "string"},
                },
                "required": ["title"],
            },
        }
