from collections.abc import Callable
from typing import List

from gradio.components.base import server
from gradio.components.textbox import Textbox
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import Events


class DialogueLine(GradioModel):
    speaker: str
    text: str

class DialogueModel(GradioRootModel):
    root: List[DialogueLine]

class Dialogue(Textbox):
    """
    Creates a dialogue components for users to enter dialogue between speakers.

    Demos: dia_dialogue_demo
    """

    EVENTS = [
        Events.change,
        Events.input,
        Events.submit,
    ]

    data_model = DialogueModel
    def __init__(self,
        value: list[dict[str, str]] | Callable | None = None,
        *,
        speakers: list[str] | None = None,
        formatter: Callable | None = None,
        emotions: list[str] | None = None,
        separator: str = " ",
        label: str | None = "Dialogue",
        info: str | None = "Type colon (:) in the dialogue line to see the available emotion and intonation tags",
        placeholder: str | None = "Enter dialogue here...",
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        autofocus: bool = False,
        autoscroll: bool = True,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        max_lines: int | None = None,
        show_submit_button: bool = True,
        show_copy_button: bool = True,
        ):
        """
        Parameters:
            value: Value of the dialogue. It is a list of dictionaries, each containing a 'speaker' key and a 'text' key. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            speakers: The different speakers allowed in the dialogue.
            formatter: A function that formats the dialogue line dictionary, e.g. {"speaker": "Speaker 1", "text": "Hello, how are you?"} into a string, e.g. "Speaker 1: Hello, how are you?".
            emotions: The different emotions and intonation allowed in the dialogue. Emotions are displayed in an autocomplete menu below the input textbox when the user starts typing `:`. Use the exact emotion name expected by the AI model or inference function.
            separator: The separator between the different dialogue lines used to join the formatted dialogue lines into a single string. For example, a newline character or empty string.
            max_lines: maximum number of lines allowed in the dialogue.
            placeholder: placeholder hint to provide behind textarea.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            show_label: if True, will display the label. If False, the copy button is hidden as well as well as the label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will be rendered as an editable textbox; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            autofocus: If True, will focus on the textbox when the page loads. Use this carefully, as it can cause usability issues for sighted and non-sighted users.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            show_copy_button: If True, includes a copy button to copy the text in the textbox. Only applies if show_label is True.
            show_submit_button: If True, includes a submit button to submit the dialogue.
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
        """
        super().__init__(value="",
                         label=label, info=info, placeholder=placeholder, show_label=show_label, container=container, scale=scale, min_width=min_width, interactive=interactive, visible=visible, elem_id=elem_id, autofocus=autofocus, autoscroll=autoscroll, elem_classes=elem_classes, render=render, key=key, max_lines=max_lines)
        self.speakers = speakers
        self.emotions = emotions or []
        self.formatter = formatter
        self.separator = separator
        self.show_submit_button = show_submit_button
        self.show_copy_button = show_copy_button
        if isinstance(value, Callable):
            value = value()
        self.value = self.preprocess(DialogueModel(root=value)) if value is not None else value # type: ignore

    def preprocess(self, payload: DialogueModel) -> str:
        """
        This docstring is used to generate the docs for this custom component.
        Parameters:
            payload: the data to be preprocessed, sent from the frontend
        Returns:
            the data after preprocessing, sent to the user's function in the backend
        """
        formatter = self.formatter
        if not formatter:
            formatter = self.default_formatter
        return self.separator.join([formatter(line.speaker, line.text) for line in payload.root])

    @staticmethod
    def default_formatter(speaker: str, text: str) -> str:
        return f"[{speaker}] {text}"

    @server
    async def format(self, value: list[dict]):
        """Format the dialogue in the frontend into a string that's copied to the clipboard."""
        data = DialogueModel(root=value) # type: ignore
        return self.preprocess(data)

    def postprocess(self, value):
        """
        This docstring is used to generate the docs for this custom component.
        Parameters:
            payload: the data to be postprocessed, sent from the user's function in the backend
        Returns:
            the data after postprocessing, sent to the frontend
        """
        return value

    def as_example(self, value):
        return self.preprocess(DialogueModel(root=value))

    def example_payload(self):
        return [{"speaker": "Speaker 1", "text": "Hello, how are you?"}, {"speaker": "Speaker 2", "text": "I'm fine, thank you!"}]

    def example_value(self):
        return [{"speaker": "Speaker 1", "text": "Hello, how are you?"}, {"speaker": "Speaker 2", "text": "I'm fine, thank you!"}]

