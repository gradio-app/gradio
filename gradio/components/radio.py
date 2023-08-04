"""gr.Radio() component."""

from __future__ import annotations

from typing import Any, Callable, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import StringSerializable

from gradio.blocks import Default, get, NoOverride
from gradio.components.base import FormComponent, IOComponent
from gradio.deprecation import warn_deprecation, warn_style_method_deprecation
from gradio.events import Changeable, EventListenerMethod, Inputable, Selectable
from gradio.interpretation import NeighborInterpretable

set_documentation_group("component")


@document()
class Radio(
    FormComponent,
    Selectable,
    Changeable,
    Inputable,
    IOComponent,
    StringSerializable,
    NeighborInterpretable,
):
    """
    Creates a set of radio buttons of which only one can be selected.
    Preprocessing: passes the value of the selected radio button as a {str} or its index as an {int} into the function, depending on `type`.
    Postprocessing: expects a {str} corresponding to the value of the radio button to be selected.
    Examples-format: a {str} representing the radio option to select.

    Demos: sentence_builder, titanic_survival, blocks_essay
    """

    def __init__(
        self,
        choices: list[str] | None | Default = Default(None),
        *,
        value: str | Callable | None | Default = Default(None),
        type: Literal["value"] | Literal["index"] | Default = Default("value"),
        label: str | None | Default = Default(None),
        info: str | None | Default = Default(None),
        every: float | None | Default = Default(None),
        show_label: bool | None | Default = Default(None),
        container: bool | Default = Default(True),
        scale: int | None | Default = Default(None),
        min_width: int | None | Default = Default(160),
        interactive: bool | None | Default = Default(None),
        visible: bool |  Default = Default(True),
        elem_id: str | None | Default = Default(None),
        elem_classes: list[str] | str | None | Default = Default(None),
        **kwargs,
    ):
        """
        Parameters:
            choices: list of options to select from.
            value: the button selected by default. If None, no button is selected by default. If callable, the function will be called whenever the app loads to set the initial value of the component.
            type: Type of value to be returned by component. "value" returns the string of the choice selected, "index" returns the index of the choice selected.
            label: component name in interface.
            info: additional component description.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, choices in this radio group will be selectable; if False, selection will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self.type = get(type)
        valid_types = ["value", "index"]
        if self.type not in valid_types + [NoOverride]:
            raise ValueError(
                f"Invalid value for parameter `type`: {self.type}. Please choose from one of: {valid_types}"
            )

        self.choices = get(choices)
        if self.choices is None:
            self.choices = []
            
        self.select: EventListenerMethod
        """
        Event listener for when the user selects Radio option.
        Uses event data gradio.SelectData to carry `value` referring to label of selected option, and `index` to refer to index.
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

    def example_inputs(self) -> dict[str, Any]:
        return {
            "raw": self.choices[0] if self.choices else None,
            "serialized": self.choices[0] if self.choices else None,
        }

    def preprocess(self, x: str | None) -> str | int | None:
        """
        Parameters:
            x: selected choice
        Returns:
            selected choice as string or index within choice list
        """
        if self.type == "value":
            return x
        elif self.type == "index":
            if x is None:
                return None
            else:
                return self.choices.index(x)
        else:
            raise ValueError(
                f"Unknown type: {self.type}. Please choose from: 'value', 'index'."
            )

    def get_interpretation_neighbors(self, x):
        choices = list(self.choices)
        choices.remove(x)
        return choices, {}

    def get_interpretation_scores(
        self, x, neighbors, scores: list[float | None], **kwargs
    ) -> list:
        """
        Returns:
            Each value represents the interpretation score corresponding to each choice.
        """
        scores.insert(self.choices.index(x), None)
        return scores

    def style(
        self,
        *,
        item_container: bool | None = None,
        container: bool | None = None,
        **kwargs,
    ):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if item_container is not None:
            warn_deprecation("The `item_container` parameter is deprecated.")
        if container is not None:
            self.container = container
        return self
