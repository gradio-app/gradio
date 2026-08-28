from __future__ import annotations

from collections.abc import Callable
from typing import Literal

from gradio_client.documentation import document

from gradio.components.base import Component, server
from gradio.components.button import Button
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import Events
from gradio.utils import set_default_buttons


class DialogueLine(GradioModel):
    speaker: str
    text: str


class DialogueModel(GradioRootModel):
    root: list[DialogueLine] | str

from gradio.events import Dependency

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
        type: Literal["list", "text"] = "text",
        speakers: list[str] | None = None,
        formatter: Callable | None = None,
        unformatter: Callable | None = None,
        tags: list[str] | None = None,
        separator: str = "\n",
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
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        autofocus: bool = False,
        autoscroll: bool = True,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        max_lines: int | None = None,
        buttons: list[Literal["copy"] | Button] | None = None,
        submit_btn: str | bool | None = False,
        ui_mode: Literal["dialogue", "text", "both"] = "both",
    ):
        """
        Parameters:
            value: Value of the dialogue. It is a list of dictionaries, each containing a 'speaker' key and a 'text' key. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            type: The type of the component, either "list" for a multi-speaker dialogue consisting of dictionaries with 'speaker' and 'text' keys or "text" for a single text input. Defaults to "text".
            speakers: The different speakers allowed in the dialogue. If `None` or an empty list, no speakers will be displayed. Instead, the component will be a standard textarea that optionally supports `tags` autocompletion.
            formatter: A function that formats the dialogue line dictionary, e.g. {"speaker": "Speaker 1", "text": "Hello, how are you?"} into a string, e.g. "Speaker 1: Hello, how are you?". This function is run on user input and the resulting string is passed into the prediction function.
            unformatter: A function that parses a formatted dialogue string back into a dialogue line dictionary. Should take a single string line and return a dictionary with 'speaker' and 'text' keys. If not provided, the default unformatter will attempt to parse the default formatter pattern.
            tags: The different tags allowed in the dialogue. Tags are displayed in an autocomplete menu below the input textbox when the user starts typing `:`. Use the exact tag name expected by the AI model or inference function.
            separator: The separator between the different dialogue lines used to join the formatted dialogue lines into a single string. It should be unambiguous. For example, a newline character or tab character.
            color_map: A dictionary mapping speaker names to colors. The colors may be specified as hex codes or by their names. For example: {"Speaker 1": "red", "Speaker 2": "#FFEE22"}. If not provided, default colors will be assigned to speakers. This is only used if `interactive` is False.
            max_lines: maximum number of lines allowed in the dialogue.
            placeholder: placeholder hint to provide behind textarea.
            label: the label for this component, displayed above the component if `show_label` is `True` and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component corresponds to.
            show_label: if True, will display the label. If False, the copy button is hidden as well as well as the label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will be rendered as an editable textbox; if False, editing will be disabled. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            autofocus: If True, will focus on the textbox when the page loads. Use this carefully, as it can cause usability issues for sighted and non-sighted users.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            buttons: A list of buttons to show for the component. Valid options are "copy" or a gr.Button() instance. The "copy" button allows the user to copy the text in the textbox. Custom gr.Button() instances will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button. By default, no buttons are shown.
            submit_btn: If False, will not show a submit button. If True, will show a submit button with an icon. If a string, will use that string as the submit button text.
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
            ui_mode: Determines the user interface mode of the component. Can be "dialogue" (displays dialogue lines), "text" (displays a single text input), or "both" (displays both dialogue lines and a text input). Defaults to "both".
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
        if separator == " ":
            raise ValueError("Separator cannot be an empty string.")
        self.ui_mode = ui_mode
        self.type = type
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
        self.buttons = set_default_buttons(buttons, None)
        self.submit_btn = submit_btn
        if not interactive:
            self.info = None

    def preprocess(self, payload: DialogueModel) -> str | list[dict[str, str]]:  # type: ignore
        """
        Parameters:
            payload: Expects a `DialogueModel` object or string.
        Returns:
            Returns the dialogue as a string or list of dictionaries.
        """
        if self.type == "list":
            return payload.model_dump()
        return self._format(payload)

    def _format(self, payload: DialogueModel) -> str:
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
    def default_unformatter(line: str, default_speaker: str) -> dict[str, str]:
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
            return {"speaker": default_speaker, "text": line}

    @server
    async def format(self, value: list[dict] | str):
        """Format the dialogue in the frontend into a string that's copied to the clipboard."""
        data = DialogueModel(root=value)  # type: ignore
        return self._format(data)

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

        default_speaker = "Unknown"
        if isinstance(self.speakers, list) and len(self.speakers):
            default_speaker = self.speakers[0]

        for line in lines:
            line = line.strip()
            if not line:
                continue

            parsed_line = unformatter(line, default_speaker)
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
    from typing import Callable, Literal, Sequence, Any, TYPE_CHECKING
    from gradio.blocks import Block
    if TYPE_CHECKING:
        from gradio.components import Timer
        from gradio.components.base import Component


    def change(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...

    def input(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...

    def submit(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        show_progress_on: Component | Sequence[Component] | None = None,
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | Literal[True] | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        api_visibility: Literal["public", "private", "undocumented"] = "public",
        key: int | str | tuple[int | str, ...] | None = None,
        api_description: str | None | Literal[False] = None,
        validator: Callable[..., Any] | None = None,

        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string or None. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            api_visibility: controls the visibility and accessibility of this endpoint. Can be "public" (shown in API docs and callable by clients), "private" (hidden from API docs and not callable by the Gradio client libraries), or "undocumented" (hidden from API docs but callable by clients and via gr.load). If fn is None, api_visibility will automatically be set to "private".
            key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
            validator: Optional validation function to run before the main function. If provided, this function will be executed first with queue=False, and only if it completes successfully will the main function be called. The validator receives the same inputs as the main function.

        """
        ...