"""gr.HighlightedText() component."""

from __future__ import annotations

from typing import Callable, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import (
    JSONSerializable,
)

from gradio.components.base import IOComponent, _Keywords
from gradio.deprecation import warn_style_method_deprecation
from gradio.events import Changeable, EventListenerMethod, Selectable

set_documentation_group("component")


@document()
class HighlightedText(Changeable, Selectable, IOComponent, JSONSerializable):
    """
    Displays text that contains spans that are highlighted by category or numerical value.
    Preprocessing: passes a list of tuples as a {List[Tuple[str, float | str | None]]]} into the function. If no labels are provided, the text will be displayed as a single span.
    Postprocessing: expects a {List[Tuple[str, float | str]]]} consisting of spans of text and their associated labels, or a {Dict} with two keys: (1) "text" whose value is the complete text, and (2) "entities", which is a list of dictionaries, each of which have the keys: "entity" (consisting of the entity label, can alternatively be called "entity_group"), "start" (the character index where the label starts), and "end" (the character index where the label ends). Entities should not overlap.

    Demos: diff_texts, text_analysis
    Guides: named-entity-recognition
    """

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
        interactive: bool | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value to show. If callable, the function will be called whenever the app loads to set the initial value of the component.
            show_legend: whether to show span categories in a separate legend or inline.
            combine_adjacent: If True, will merge the labels of adjacent tokens belonging to the same category.
            adjacent_separator: Specifies the separator to be used between tokens if combine_adjacent is True.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            interactive: If True, the component will be editable, and allow user to select spans of text and label them.

        """
        self.color_map = color_map
        self.show_legend = show_legend
        self.combine_adjacent = combine_adjacent
        self.adjacent_separator = adjacent_separator
        self.select: EventListenerMethod
        """
        Event listener for when the user selects Highlighted text span.
        Uses event data gradio.SelectData to carry `value` referring to selected [text, label] tuple, and `index` to refer to span index.
        See EventData documentation on how to use this event data.
        """
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
            interactive=interactive,
            **kwargs,
        )

    def get_config(self):
        return {
            "color_map": self.color_map,
            "show_legend": self.show_legend,
            "value": self.value,
            "selectable": self.selectable,
            "combine_adjacent": self.combine_adjacent,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: list[tuple[str, str | float | None]]
        | dict
        | Literal[_Keywords.NO_VALUE]
        | None = _Keywords.NO_VALUE,
        color_map: dict[str, str] | None = None,
        show_legend: bool | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
        interactive: bool | None = None,
    ):
        updated_config = {
            "color_map": color_map,
            "show_legend": show_legend,
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "interactive": interactive,
            "__type__": "update",
        }
        return updated_config

    def postprocess(
        self, y: list[tuple[str, str | float | None]] | dict | None
    ) -> list[tuple[str, str | float | None]] | None:
        """
        Parameters:
            y: List of (word, category) tuples, or a dictionary of two keys: "text", and "entities", which itself is a list of dictionaries, each of which have the keys: "entity" (or "entity_group"), "start", and "end"
        Returns:
            List of (word, category) tuples
        """
        if y is None:
            return None
        if isinstance(y, dict):
            try:
                text = y["text"]
                entities = y["entities"]
            except KeyError as ke:
                raise ValueError(
                    "Expected a dictionary with keys 'text' and 'entities' "
                    "for the value of the HighlightedText component."
                ) from ke
            if len(entities) == 0:
                y = [(text, None)]
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
                y = list_format
        if self.combine_adjacent:
            output = []
            running_text, running_category = None, None
            for text, category in y:
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
            return output
        else:
            return y

    def style(
        self,
        *,
        color_map: dict[str, str] | None = None,
        container: bool | None = None,
        **kwargs,
    ):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if container is not None:
            self.container = container
        if color_map is not None:
            self.color_map = color_map
        return self
