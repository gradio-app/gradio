"""gr.Chatbot() component."""

from __future__ import annotations

import inspect
import warnings
from pathlib import Path
from typing import Any, Callable, List, Literal, Optional, Tuple, Union

from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group

from gradio import utils
from gradio.components.base import Component, _Keywords
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.deprecation import warn_deprecation, warn_style_method_deprecation
from gradio.events import Events

# from pydantic import Field, TypeAdapter

set_documentation_group("component")


class FileMessage(GradioModel):
    file: FileData
    alt_text: Optional[str] = None


# _Message = Annotated[List[Union[str, FileMessage, None]], Field(min_length=2, max_length=2)]

# Message = TypeAdapter(_Message)


class ChatbotData(GradioRootModel):
    root: List[Tuple[Union[str, FileMessage, None], Union[str, FileMessage, None]]]

from gradio.events import Dependency

@document()
class Chatbot(Component):
    """
    Displays a chatbot output showing both user submitted messages and responses. Supports a subset of Markdown including bold, italics, code, tables. Also supports audio/video/image files, which are displayed in the Chatbot, and other kinds of files which are displayed as links.
    Preprocessing: passes the messages in the Chatbot as a {List[List[str | None | Tuple]]}, i.e. a list of lists. The inner list has 2 elements: the user message and the response message. See `Postprocessing` for the format of these messages.
    Postprocessing: expects function to return a {List[List[str | None | Tuple]]}, i.e. a list of lists. The inner list should have 2 elements: the user message and the response message. The individual messages can be (1) strings in valid Markdown, (2) tuples if sending files: (a filepath or URL to a file, [optional string alt text]) -- if the file is image/video/audio, it is displayed in the Chatbot, or (3) None, in which case the message is not displayed.

    Demos: chatbot_simple, chatbot_multimodal
    Guides: creating-a-chatbot
    """

    EVENTS = [Events.change, Events.select, Events.like]
    data_model = ChatbotData

    def __init__(
        self,
        value: list[list[str | tuple[str] | tuple[str | Path, str] | None]]
        | Callable
        | None = None,
        color_map: dict[str, str] | None = None,
        *,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        height: int | None = None,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        rtl: bool = False,
        show_share_button: bool | None = None,
        show_copy_button: bool = False,
        avatar_images: tuple[str | Path | None, str | Path | None] | None = None,
        sanitize_html: bool = True,
        bubble_full_width: bool = True,
        **kwargs,
    ):
        """
        Parameters:
            value: Default value to show in chatbot. If callable, the function will be called whenever the app loads to set the initial value of the component.
            color_map: This parameter is deprecated.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            height: height of the component in pixels.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$$", "right": "$$", "display": True }]`, so only expressions enclosed in $$ delimiters will be rendered as LaTeX, and in a new line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html).
            rtl: If True, sets the direction of the rendered text to right-to-left. Default is False, which renders text left-to-right.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_copy_button: If True, will show a copy button for each chatbot message.
            avatar_images: Tuple of two avatar image paths or URLs for user and bot (in that order). Pass None for either the user or bot image to skip. Must be within the working directory of the Gradio app or an external URL.
            sanitize_html: If False, will disable HTML sanitization for chatbot messages. This is not recommended, as it can lead to security vulnerabilities.
            bubble_full_width: If False, the chat bubble will fit to the content of the message. If True (default), the chat bubble will be the full width of the component.
        """
        if color_map is not None:
            warn_deprecation("The 'color_map' parameter has been deprecated.")
        """
        Event listener for when the user selects message from Chatbot.
        Uses event data gradio.SelectData to carry `value` referring to text of selected message, and `index` tuple to refer to [message, participant] index.
        See EventData documentation on how to use this event data.
        """
        self.likeable = False
        self.height = height
        self.rtl = rtl
        if latex_delimiters is None:
            latex_delimiters = [{"left": "$$", "right": "$$", "display": True}]
        self.latex_delimiters = latex_delimiters
        self.avatar_images = avatar_images or (None, None)
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        self.show_copy_button = show_copy_button
        self.sanitize_html = sanitize_html
        self.bubble_full_width = bubble_full_width

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
            value=value,
            **kwargs,
        )

    @staticmethod
    def update(
        value: list[list[str | tuple[str] | tuple[str, str] | None]]
        | Literal[_Keywords.NO_VALUE]
        | None = _Keywords.NO_VALUE,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        visible: bool | None = None,
        height: int | None = None,
        rtl: bool | None = None,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        show_share_button: bool | None = None,
        show_copy_button: bool | None = None,
        avatar_images: tuple[str | Path | None] | None = None,
        sanitize_html: bool | None = None,
        bubble_full_width: bool | None = None,
    ):
        warnings.warn(
            "Using the update method is deprecated. Simply return a new object instead, e.g. `return gr.Chatbot(...)` instead of `return gr.Chatbot.update(...)`."
        )
        updated_config = {
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "visible": visible,
            "value": value,
            "height": height,
            "show_share_button": show_share_button,
            "rtl": rtl,
            "latex_delimiters": latex_delimiters,
            "show_copy_button": show_copy_button,
            "avatar_images": avatar_images,
            "sanitize_html": sanitize_html,
            "bubble_full_width": bubble_full_width,
            "__type__": "update",
        }
        return updated_config

    def _preprocess_chat_messages(
        self, chat_message: str | dict | None
    ) -> str | tuple[str] | tuple[str, str] | None:
        if chat_message is None:
            return None
        elif isinstance(chat_message, dict):
            if chat_message.get("alt_text"):
                return (chat_message["file"]["name"], chat_message["alt_text"])
            else:
                return (chat_message["file"]["name"],)
        else:  # string
            return chat_message

    def preprocess(
        self,
        y: list[list[str | dict | None] | tuple[str | dict | None, str | dict | None]],
    ) -> list[list[str | tuple[str] | tuple[str, str] | None]]:
        if y is None:
            return y
        processed_messages = []
        for message_pair in y:
            assert isinstance(
                message_pair, (tuple, list)
            ), f"Expected a list of lists or list of tuples. Received: {message_pair}"
            assert (
                len(message_pair) == 2
            ), f"Expected a list of lists of length 2 or list of tuples of length 2. Received: {message_pair}"
            processed_messages.append(
                [
                    self._preprocess_chat_messages(message_pair[0]),
                    self._preprocess_chat_messages(message_pair[1]),
                ]
            )
        return processed_messages

    def _postprocess_chat_messages(
        self, chat_message: str | tuple | list | None
    ) -> str | FileMessage | None:
        if chat_message is None:
            return None
        elif isinstance(chat_message, (tuple, list)):
            filepath = str(chat_message[0])

            mime_type = client_utils.get_mimetype(filepath)
            return FileMessage(
                file=FileData(name=filepath, is_file=True, mime_type=mime_type),
                alt_text=chat_message[1] if len(chat_message) > 1 else None,
            )
        elif isinstance(chat_message, str):
            chat_message = inspect.cleandoc(chat_message)
            return chat_message
        else:
            raise ValueError(f"Invalid message for Chatbot component: {chat_message}")

    def postprocess(
        self,
        y: list[list[str | tuple[str] | tuple[str, str] | None] | tuple],
    ) -> ChatbotData:
        """
        Parameters:
            y: List of lists representing the message and response pairs. Each message and response should be a string, which may be in Markdown format.  It can also be a tuple whose first element is a string or pathlib.Path filepath or URL to an image/video/audio, and second (optional) element is the alt text, in which case the media file is displayed. It can also be None, in which case that message is not displayed.
        Returns:
            List of lists representing the message and response. Each message and response will be a string of HTML, or a dictionary with media information. Or None if the message is not to be displayed.
        """
        if y is None:
            return ChatbotData(root=[])
        processed_messages = []
        for message_pair in y:
            assert isinstance(
                message_pair, (tuple, list)
            ), f"Expected a list of lists or list of tuples. Received: {message_pair}"
            assert (
                len(message_pair) == 2
            ), f"Expected a list of lists of length 2 or list of tuples of length 2. Received: {message_pair}"
            processed_messages.append(
                [
                    self._postprocess_chat_messages(message_pair[0]),
                    self._postprocess_chat_messages(message_pair[1]),
                ]
            )
        return ChatbotData(root=processed_messages)

    def style(self, height: int | None = None, **kwargs):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if height is not None:
            self.height = height
        return self

    def example_inputs(self) -> Any:
        return [["Hello!", None]]

    
    def change(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        status_tracker: None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        _js: str | None = None,) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            status_tracker: Deprecated and has no effect.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        """
        ...
    
    def select(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        status_tracker: None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        _js: str | None = None,) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            status_tracker: Deprecated and has no effect.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        """
        ...
    
    def like(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        status_tracker: None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        _js: str | None = None,) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            status_tracker: Deprecated and has no effect.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        """
        ...