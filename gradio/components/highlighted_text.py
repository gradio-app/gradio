"""gr.HighlightedText() component."""

from __future__ import annotations

from typing import Any, Callable, List, Union

from gradio_client.documentation import document, set_documentation_group

from gradio.components.base import Component
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import Events

set_documentation_group("component")


class HighlightedToken(GradioModel):
    token: str
    class_or_confidence: Union[str, float, None] = None


class HighlightedTextData(GradioRootModel):
    root: List[HighlightedToken]


@document()
class HighlightedText(Component):
    """
    Displays text that contains spans that are highlighted by category or numerical value.
    Preprocessing: passes a list of tuples as a {List[Tuple[str, float | str | None]]]} into the function. If no labels are provided, the text will be displayed as a single span.
    Postprocessing: expects a {List[Tuple[str, float | str]]]} consisting of spans of text and their associated labels, or a {Dict} with two keys: (1) "text" whose value is the complete text, and (2) "entities", which is a list of dictionaries, each of which have the keys: "entity" (consisting of the entity label, can alternatively be called "entity_group"), "start" (the character index where the label starts), and "end" (the character index where the label ends). Entities should not overlap.

    Demos: diff_texts, text_analysis
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
        combine_adjacent: bool = False,
        adjacent_separator: str = "",
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        interactive: bool | None = None,
    ):
        """
        Parameters:
            value: Default value to show. If callable, the function will be called whenever the app loads to set the initial value of the component.
            color_map: A dictionary mapping labels to colors. The colors may be specified as hex codes or by their names. For example: {"person": "red", "location": "#FFEE22"}
            show_legend: whether to show span categories in a separate legend or inline.
            combine_adjacent: If True, will merge the labels of adjacent tokens belonging to the same category.
            adjacent_separator: Specifies the separator to be used between tokens if combine_adjacent is True.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            interactive: If True, the component will be editable, and allow user to select spans of text and label them.
        """
        self.color_map = color_map
        self.show_legend = show_legend
        self.combine_adjacent = combine_adjacent
        self.adjacent_separator = adjacent_separator
        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            value=value,
            interactive=interactive,
        )

    def example_inputs(self) -> Any:
        return {"value": [{"token": "Hello", "class_or_confidence": "1"}]}

    def postprocess(
        self, value: list[tuple[str, str | float | None]] | dict | None
    ) -> HighlightedTextData | None:
        """
        Parameters:
            value: List of (word, category) tuples, or a dictionary of two keys: "text", and "entities", which itself is a list of dictionaries, each of which have the keys: "entity" (or "entity_group"), "start", and "end"
        Returns:
            List of (word, category) tuples
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

    def preprocess(self, payload: HighlightedTextData | None) -> dict | None:
        if payload is None:
            return None
        return payload.model_dump()
