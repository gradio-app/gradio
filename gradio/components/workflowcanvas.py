"""gr.WorkflowCanvas() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.components.base import Component, server
from gradio.events import Events
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class WorkflowCanvas(BlockContext, Component):
    """
    Visual canvas for building AI pipelines by connecting Hugging Face Spaces.

    Used internally by `gr.Workflow`. Can also be used directly if you need fine-grained
    control over the server functions exposed to the canvas.

    Example:
        ```python
        import gradio as gr

        with gr.Blocks() as demo:
            canvas = gr.WorkflowCanvas(server_functions=[my_fn])
        demo.launch()
        ```
    """

    EVENTS = [Events.change]

    def __init__(
        self,
        value: str | Callable[..., str | None] | None = None,
        *,
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool = False,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        container: bool = False,
        server_functions: list[Callable] | None = None,
    ):
        """
        Parameters:
            value: Initial workflow JSON string. If a callable is passed, it is called on each browser session load and its return value is used as the initial workflow.
            label: Label for this component.
            every: Continously calls `value` to recalculate it if `value` is a function.
            inputs: Components used as inputs to calculate `value` if `value` is a function.
            show_label: If True, the label will be displayed.
            visible: If False, component will be hidden.
            elem_id: Optional string assigned as the id of this component in the DOM.
            elem_classes: Optional list of strings assigned as the classes of this component.
            render: If False, component will not be rendered in the Blocks context.
            key: In a gr.render, components with the same key across re-renders are treated as the same component.
            preserved_by_key: Parameters preserved across re-renders with the same key.
            container: If True, displayed in a container.
            server_functions: Python functions callable from the canvas frontend via the `server` object.
        """
        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
        )
        Component.__init__(
            self,
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
            container=container,
        )
        if server_functions:
            seen: set[str] = set()
            for fn in server_functions:
                fn_name = getattr(fn, "__name__", str(fn))
                if fn_name in seen:
                    raise ValueError(
                        f"WorkflowCanvas: duplicate server_function name '{fn_name}'. "
                        "Each function must have a unique __name__."
                    )
                seen.add(fn_name)
                decorated = server(fn)
                setattr(self, fn_name, decorated)
                self.server_fns.append(decorated)

    def example_payload(self) -> Any:
        return None

    def example_value(self) -> Any:
        return None

    def preprocess(self, payload: str | None) -> str | None:
        return payload

    def postprocess(self, value: str | None) -> str | None:
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

    def get_block_name(self):
        return "workflowcanvas"
