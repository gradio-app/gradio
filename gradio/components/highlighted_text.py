"""gr.HighlightedText() component."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Union

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import Events
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


class HighlightedToken(GradioModel):
    token: str
    class_or_confidence: Union[str, float, None] = None


class HighlightedTextData(GradioRootModel):
    root: list[HighlightedToken]


@document()
class HighlightedText(Component):
    """
    Displays text that contains spans that are highlighted by category or numerical value.

    Demos: diff_texts
    Guides: named-entity-recognition
    """

    data_model = HighlightedTextData
    EVENTS = [Events.change, Events.select]

    def __init__(
        self,
        value: list[tuple[str, str | float | None]] | dict | Callable | None = None,
        *,
        color_map: dict[str, str]
        | None = None,  # Parameter moved to HighlightedText.style()
        show_legend: bool = False,
        show_inline_category: bool = True,
        combine_adjacent: bool = False,
        adjacent_separator: str = "",
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        interactive: bool | None = None,
        rtl: bool = False,
    ):
        """
        Parameters:
            value: Default value to show. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            color_map: A dictionary mapping labels to colors. The colors may be specified as hex codes or by their names. For example: {"person": "red", "location": "#FFEE22"}
            show_legend: whether to show span categories in a separate legend or inline.
            show_inline_category: If False, will not display span category label. Only applies if show_legend=False and interactive=False.
            combine_adjacent: If True, will merge the labels of adjacent tokens belonging to the same category.
            adjacent_separator: Specifies the separator to be used between tokens if combine_adjacent is True.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            interactive: If True, the component will be editable, and allow user to select spans of text and label them.
            rtl: If True, will display the text in right-to-left direction, and the labels in the legend will also be aligned to the right.
        """
        self.color_map = color_map
        self.show_legend = show_legend
        self.show_inline_category = show_inline_category
        self.combine_adjacent = combine_adjacent
        self.adjacent_separator = adjacent_separator
        self.rtl = rtl
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
            interactive=interactive,
        )
        self._value_description = "a list of 2-part tuples, where the first part is a substring of the text and the second part is the category or value of that substring."

    def example_payload(self) -> Any:
        return [
            {"token": "The", "class_or_confidence": None},
            {"token": "quick", "class_or_confidence": "adj"},
        ]

    def example_value(self) -> Any:
        return [("The", None), ("quick", "adj"), ("brown", "adj"), ("fox", "noun")]

    def preprocess(
        self, payload: HighlightedTextData | None
    ) -> list[tuple[str, str | float | None]] | None:
        """
        Parameters:
            payload: An instance of HighlightedTextData
        Returns:
            Passes the value as a list of tuples as a `list[tuple]` into the function. Each `tuple` consists of a `str` substring of the text (so the entire text is included) and `str | float | None` label, which is the category or confidence of that substring.
        """
        if payload is None:
            return None
        return payload.model_dump()  # type: ignore

    def postprocess(
        self, value: list[tuple[str, str | float | None]] | dict | None
    ) -> HighlightedTextData | None:
        """
        Parameters:
            value: Expects a list of (word, category) tuples, or a dictionary of two keys: "text", and "entities", which itself is a list of dictionaries, each of which have the keys: "entity" (or "entity_group"), "start", and "end"
        Returns:
            An instance of HighlightedTextData
        """
        if value is None:
            return None
        if isinstance(value, dict):
            try:
                text = value["text"]
                entities = value["entities"]
            except KeyError as ke:
                raise ValueError(
                    "Expected a dictionary with keys 'text' and 'entities' "
                    "for the value of the HighlightedText component."
                ) from ke
            if len(entities) == 0:
                value = [(text, None)]
            else:
                list_format = []
                index = 0
                entities = sorted(entities, key=lambda x: x["start"])
                for entity in entities:
                    list_format.append((text[index : entity["start"]], None))
                    entity_category = entity.get("entity") or entity.get("entity_group")
                    list_format.append(
                        (text[entity["start"] : entity["end"]], entity_category)
                    )
                    index = entity["end"]
                list_format.append((text[index:], None))
                value = list_format
        if self.combine_adjacent:
            output = []
            running_text, running_category = None, None
            for text, category in value:
                if running_text is None:
                    running_text = text
                    running_category = category
                elif category == running_category:
                    running_text += self.adjacent_separator + text
                elif not text:
                    # Skip fully empty item, these get added in processing
                    # of dictionaries.
                    pass
                else:
                    output.append((running_text, running_category))
                    running_text = text
                    running_category = category
            if running_text is not None:
                output.append((running_text, running_category))
            return HighlightedTextData(
                root=[
                    HighlightedToken(token=o[0], class_or_confidence=o[1])
                    for o in output
                ]
            )
        else:
            return HighlightedTextData(
                root=[
                    HighlightedToken(token=o[0], class_or_confidence=o[1])
                    for o in value
                ]
            )
