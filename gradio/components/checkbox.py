"""gr.Checkbox() component."""

from __future__ import annotations

from typing import Callable, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import BooleanSerializable

from gradio.components.base import FormComponent, IOComponent, _Keywords
from gradio.events import Changeable, EventListenerMethod, Inputable, Selectable
from gradio.interpretation import NeighborInterpretable

set_documentation_group("component")


@document()
class Checkbox(
    FormComponent,
    Changeable,
    Inputable,
    Selectable,
    IOComponent,
    BooleanSerializable,
    NeighborInterpretable,
):
    """
    Creates a checkbox that can be set to `True` or `False`.

    Preprocessing: passes the status of the checkbox as a {bool} into the function.
    Postprocessing: expects a {bool} returned from the function and, if it is True, checks the checkbox.
    Examples-format: a {bool} representing whether the box is checked.
    Demos: sentence_builder, titanic_survival
    """

    def __init__(
        self,
        value: bool | Callable = False,
        *,
        label: str | None = None,
        info: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: if True, checked by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            label: component name in interface.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, this checkbox can be checked; if False, checking will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.select: EventListenerMethod
        """
        Event listener for when the user selects or deselects Checkbox.
        Uses event data gradio.SelectData to carry `value` referring to label of checkbox, and `selected` to refer to state of checkbox.
        See EventData documentation on how to use this event data.
        """
        IOComponent.__init__(
            self,
            label=label,
            info=info,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            value=value,
            **kwargs,
        )
        NeighborInterpretable.__init__(self)

    def get_config(self):
        return {
            "value": self.value,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: bool | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        label: str | None = None,
        info: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool | None = None,
        visible: bool | None = None,
    ):
        return {
            "label": label,
            "info": info,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "__type__": "update",
        }

    def get_interpretation_neighbors(self, x):
        return [not x], {}

    def get_interpretation_scores(self, x, neighbors, scores, **kwargs):
        """
        Returns:
            The first value represents the interpretation score if the input is False, and the second if the input is True.
        """
        if x:
            return scores[0], None
        else:
            return None, scores[0]
