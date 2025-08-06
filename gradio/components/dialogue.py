from __future__ import annotations

from collections.abc import Callable

from gradio_client.documentation import document

from gradio.components.base import Component, server
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import Events


class DialogueLine(GradioModel):
    speaker: str
    text: str


class DialogueModel(GradioRootModel):
    root: list[DialogueLine] | str


@document()
class Dialogue(Component):
    """
    Creates a Dialogue component for displaying or collecting multi-speaker conversations. This component can be used as input to allow users to enter dialogue involving multiple speakers, or as output to display diarized speech, such as the result of a transcription or speaker identification model. Each message can be associated with a specific speaker, making it suitable for use cases like conversations, interviews, or meetings.

    Demos: dia_dialogue_demo
    """

    EVENTS = [
        Events.change,
        Events.input,
        Events.submit,
    ]

    data_model = DialogueModel

    def __init__(
        self,
        value: list[dict[str, str]] | Callable | None = None,
        *,
        speakers: list[str] | None = None,
        formatter: Callable | None = None,
        unformatter: Callable | None = None,
        tags: list[str] | None = None,
        separator: str = " ",
        color_map: dict[str, str] | None = None,
        label: str | None = "Dialogue",
        info: str
        | None = "Type colon (:) in the dialogue line to see the available tags",
        placeholder: str | None = None,
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
            speakers: The different speakers allowed in the dialogue. If `None` or an empty list, no speakers will be displayed. Instead, the component will be a standard textarea that optionally supports `tags` autocompletion.
            formatter: A function that formats the dialogue line dictionary, e.g. {"speaker": "Speaker 1", "text": "Hello, how are you?"} into a string, e.g. "Speaker 1: Hello, how are you?". This function is run on user input and the resulting string is passed into the prediction function.
            unformatter: A function that parses a formatted dialogue string back into a dialogue line dictionary. Should take a single string line and return a dictionary with 'speaker' and 'text' keys. If not provided, the default unformatter will attempt to parse the default formatter pattern.
            tags: The different tags allowed in the dialogue. Tags are displayed in an autocomplete menu below the input textbox when the user starts typing `:`. Use the exact tag name expected by the AI model or inference function.
            separator: The separator between the different dialogue lines used to join the formatted dialogue lines into a single string. For example, a newline character or empty string.
            color_map: A dictionary mapping speaker names to colors. The colors may be specified as hex codes or by their names. For example: {"Speaker 1": "red", "Speaker 2": "#FFEE22"}. If not provided, default colors will be assigned to speakers. This is only used if `interactive` is False.
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
        super().__init__(
            value=value,
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
        )
        self.placeholder = placeholder
        self.autofocus = autofocus
        self.autoscroll = autoscroll
        self.max_lines = max_lines
        self.speakers = speakers
        self.tags = tags or []
        self.formatter = formatter
        self.unformatter = unformatter
        self.separator = separator
        self.color_map = color_map
        self.show_submit_button = show_submit_button
        self.show_copy_button = show_copy_button
        if not interactive:
            self.info = None

    def preprocess(self, payload: DialogueModel) -> str:  # type: ignore
        """
        Parameters:
            payload: Expects a `DialogueModel` object or string.
        Returns:
            Returns the dialogue as a string.
        """
        if (isinstance(payload.root, str) and payload.root == "") or (
            isinstance(payload.root, list)
            and len(payload.root) == 1
            and payload.root[0].text == ""
        ):
            return ""
        formatter = self.formatter
        if not formatter:
            formatter = self.default_formatter
        if isinstance(payload.root, str):
            return payload.root
        return self.separator.join(
            [formatter(line.speaker, line.text) for line in payload.root]
        )

    @staticmethod
    def default_formatter(speaker: str, text: str) -> str:
        return f"[{speaker}] {text}"

    @staticmethod
    def default_unformatter(line: str) -> dict[str, str]:
        """Parse a formatted dialogue line back into speaker and text components."""
        line = line.strip()
        if not line:
            return {"speaker": "", "text": ""}

        # Try to parse using the default formatter pattern: [speaker] text
        if line.startswith("[") and "]" in line:
            bracket_end = line.find("]")
            speaker = line[1:bracket_end]
            text = line[bracket_end + 1 :].strip()
            return {"speaker": speaker, "text": text}
        else:
            # If it doesn't match the default pattern, treat as unknown speaker
            return {"speaker": "Unknown", "text": line}

    @server
    async def format(self, value: list[dict] | str):
        """Format the dialogue in the frontend into a string that's copied to the clipboard."""
        data = DialogueModel(root=value)  # type: ignore
        return self.preprocess(data)

    @server
    async def unformat(self, payload: dict):
        """Parse a formatted dialogue string back into dialogue data structure."""

        value = payload.get("text", "")

        if not value or value.strip() == "":
            return []

        lines = value.split(self.separator)
        dialogue_lines = []
        unformatter = self.unformatter
        if not unformatter:
            unformatter = self.default_unformatter

        for line in lines:
            line = line.strip()
            if not line:
                continue

            parsed_line = unformatter(line)
            if parsed_line["speaker"] or parsed_line["text"]:  # Skip empty lines
                dialogue_lines.append(parsed_line)

        return dialogue_lines

    def postprocess(  # type: ignore
        self, value: list[dict[str, str]] | str | None
    ) -> DialogueModel | None:
        """
        Parameters:
            value: Expects a string or a list of dictionaries of dialogue lines, where each dictionary contains 'speaker' and 'text' keys, or a string.
        Returns:
            Returns the dialogue as a `DialogueModel` object for the frontend.
        """
        if value is None:
            return None

        if isinstance(value, str):
            return DialogueModel(root=value)

        dialogue_lines = [
            DialogueLine(speaker=line["speaker"], text=line["text"]) for line in value
        ]
        return DialogueModel(root=dialogue_lines)

    def as_example(self, value):
        return self.preprocess(DialogueModel(root=value))

    def example_payload(self):
        return [
            {"speaker": "Speaker 1", "text": "Hello, how are you?"},
            {"speaker": "Speaker 2", "text": "I'm fine, thank you!"},
        ]

    def example_value(self):
        return [
            {"speaker": "Speaker 1", "text": "Hello, how are you?"},
            {"speaker": "Speaker 2", "text": "I'm fine, thank you!"},
        ]
