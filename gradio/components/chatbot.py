"""gr.Chatbot() component."""

from __future__ import annotations

import copy
import inspect
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    Union,
    cast,
)

from gradio_client import utils as client_utils
from gradio_client.documentation import document
from typing_extensions import NotRequired, TypedDict

from gradio import utils
from gradio.component_meta import ComponentMeta
from gradio.components import (
    Component as GradioComponent,
)
from gradio.components.base import Component
from gradio.components.button import Button
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons


@document()
class MetadataDict(TypedDict):
    """
    A typed dictionary to represent metadata for a message in the Chatbot component. An
    instance of this dictionary is used for the `metadata` field in a ChatMessage when
    the chat message should be displayed as a thought.
    Parameters:
        title: The title of the "thought" message. Required if the message is to be displayed as a thought.
        id: The ID of the message. Only used for nested thoughts. Nested thoughts can be nested by setting the parent_id to the id of the parent thought.
        parent_id: The ID of the parent message. Only used for nested thoughts.
        log: A string message to display next to the thought title in a subdued font.
        duration: The duration of the message in seconds. Appears next to the thought title in a subdued font inside a parentheses.
        status: if set to `"pending"`, a spinner appears next to the thought title and the accordion is initialized open.  If `status` is `"done"`, the thought accordion is initialized closed. If `status` is not provided, the thought accordion is initialized open and no spinner is displayed.
    """

    title: NotRequired[str]
    id: NotRequired[int | str]
    parent_id: NotRequired[int | str]
    log: NotRequired[str]
    duration: NotRequired[float]
    status: NotRequired[Literal["pending", "done"]]


@document()
class OptionDict(TypedDict):
    """
    A typed dictionary to represent an option in a ChatMessage. A list of these
    dictionaries is used for the `options` field in a ChatMessage.
    Parameters:
        value: The value to return when the option is selected.
        label: The text to display in the option, if different from the value.
    """

    value: str
    label: NotRequired[str]


class FileDataDict(TypedDict):
    path: str  # server filepath
    url: NotRequired[str | None]  # normalised server url
    size: NotRequired[int | None]  # size in bytes
    orig_name: NotRequired[str | None]  # original filename
    mime_type: NotRequired[str | None]
    is_stream: NotRequired[bool]
    meta: dict[Literal["_type"], Literal["gradio.FileData"]]


class TextMessage(GradioModel):
    text: str
    type: Literal["text"] = "text"


class TextMessageDict(TypedDict):
    text: str
    type: Literal["text"]


class ComponentMessage(GradioModel):
    component: str
    value: Any
    constructor_args: dict[str, Any]
    props: dict[str, Any]
    type: Literal["component"] = "component"


class ComponentMessageDict(TypedDict):
    component: str
    value: Any
    constructor_args: dict[str, Any]
    props: dict[str, Any]
    type: Literal["component"]
    instance: NotRequired[GradioComponent]


MessageContent = Union[str, FileDataDict, FileData, Component]


class MessageDict(TypedDict):
    content: MessageContent | list[MessageContent]
    role: Literal["user", "assistant", "system"]
    metadata: NotRequired[MetadataDict]
    options: NotRequired[list[OptionDict]]


class FileMessage(GradioModel):
    file: FileData
    alt_text: str | None = None
    type: Literal["file"] = "file"


class FileMessageDict(TypedDict):
    file: FileDataDict
    alt_text: NotRequired[str | None]
    type: Literal["file"]


NormalizedMessageContent = Union[TextMessageDict, FileMessageDict, ComponentMessageDict]


class NormalizedMessageDict(TypedDict):
    content: list[NormalizedMessageContent]
    role: Literal["user", "assistant", "system"]
    metadata: NotRequired[MetadataDict]
    options: NotRequired[list[OptionDict]]


class Message(GradioModel):
    role: str
    metadata: MetadataDict | None = None
    content: list[Union[TextMessage, FileMessage, ComponentMessage]]
    options: list[OptionDict] | None = None


class ExampleMessage(TypedDict):
    icon: NotRequired[
        str | FileDataDict
    ]  # filepath or url to an image to be shown in example box
    display_text: NotRequired[
        str
    ]  # text to be shown in example box. If not provided, main_text will be shown
    text: NotRequired[str]  # text to be added to chatbot when example is clicked
    files: NotRequired[
        Sequence[str | FileDataDict]
    ]  # list of file paths or URLs to be added to chatbot when example is clicked


@document()
@dataclass
class ChatMessage:
    """
    A dataclass that represents a message in the Chatbot component (with type="messages"). The only required field is `content`. The value of `gr.Chatbot` is a list of these dataclasses.
    Parameters:
        content: The content of the message. Can be a string, a file dict, a gradio component, or a list of these types to group these messages together.
        role: The role of the message, which determines the alignment of the message in the chatbot. Can be "user", "assistant", or "system". Defaults to "assistant".
        metadata: The metadata of the message, which is used to display intermediate thoughts / tool usage. Should be a dictionary with the following keys: "title" (required to display the thought), and optionally: "id" and "parent_id" (to nest thoughts), "duration" (to display the duration of the thought), "status" (to display the status of the thought).
        options: The options of the message. A list of Option objects, which are dictionaries with the following keys: "label" (the text to display in the option), and optionally "value" (the value to return when the option is selected if different from the label).
    """

    content: MessageContent | list[MessageContent]
    role: Literal["user", "assistant", "system"] = "assistant"
    metadata: MetadataDict = field(default_factory=MetadataDict)
    options: list[OptionDict] = field(default_factory=list)


class ChatbotDataMessages(GradioRootModel):
    root: list[Message]


if TYPE_CHECKING:
    from gradio.components import Timer


def import_component_and_data(
    component_name: str,
) -> type[Component] | None:
    try:
        for component in utils.get_all_components():
            if component_name == component.__name__ and isinstance(
                component, ComponentMeta
            ):
                return component  # ty: ignore[invalid-return-type]
    except ModuleNotFoundError as e:
        raise ValueError(f"Error importing {component_name}: {e}") from e
    except AttributeError:
        pass


@document()
class Chatbot(Component):
    """
    Creates a chatbot that displays user-submitted messages and responses. Supports a subset of Markdown including bold, italics, code, tables.
    Also supports audio/video/image files, which are displayed in the Chatbot, and other kinds of files which are displayed as links. This
    component is usually used as an output component.

    Demos: chatbot_simple, chatbot_streaming, chatbot_with_tools, chatbot_core_components
    Guides: chatbot-specific-events, conversational-chatbot, creating-a-chatbot-fast, creating-a-custom-chatbot-with-blocks, agents-and-tool-usage
    """

    data_model = ChatbotDataMessages

    EVENTS = [
        Events.change,
        Events.select,
        Events.like,
        Events.retry,
        Events.undo,
        Events.example_select,
        Events.option_select,
        Events.clear,
        Events.copy,
        Events.edit,
    ]

    def __init__(
        self,
        value: (list[MessageDict | Message] | Callable | None) = None,
        *,
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        autoscroll: bool = True,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        height: int | str | None = 400,
        resizable: bool = False,
        max_height: int | str | None = None,
        min_height: int | str | None = None,
        editable: Literal["user", "all"] | None = None,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        rtl: bool = False,
        buttons: list[Literal["share", "copy", "copy_all"] | Button] | None = None,
        watermark: str | None = None,
        avatar_images: tuple[str | Path | None, str | Path | None] | None = None,
        sanitize_html: bool = True,
        render_markdown: bool = True,
        feedback_options: list[str] | tuple[str, ...] | None = ("Like", "Dislike"),
        feedback_value: Sequence[str | None] | None = None,
        line_breaks: bool = True,
        layout: Literal["panel", "bubble"] | None = None,
        placeholder: str | None = None,
        examples: list[ExampleMessage] | None = None,
        allow_file_downloads=True,
        group_consecutive_messages: bool = True,
        allow_tags: list[str] | bool = True,
        reasoning_tags: list[tuple[str, str]] | None = None,
        like_user_message: bool = False,
    ):
        """
        Parameters:
            value: Default list of messages to show in chatbot, where each message is of the format {"role": "user", "content": "Help me."}. Role can be one of "user", "assistant", or "system". Content should be either text, or media passed as a Gradio component, e.g. {"content": gr.Image("lion.jpg")}. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If messages exceed the height, the component will scroll.
            resizable: If True, the user of the Gradio app can resize the chatbot by dragging the bottom right corner.
            max_height: The maximum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If messages exceed the height, the component will scroll. If messages are shorter than the height, the component will shrink to fit the content. Will not have any effect if `height` is set and is smaller than `max_height`.
            min_height: The minimum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If messages exceed the height, the component will expand to fit the content. Will not have any effect if `height` is set and is larger than `min_height`.
            editable: Allows user to edit messages in the chatbot. If set to "user", allows editing of user messages. If set to "all", allows editing of assistant messages as well.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$$", "right": "$$", "display": True }]`, so only expressions enclosed in $$ delimiters will be rendered as LaTeX, and in a new line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html).
            rtl: If True, sets the direction of the rendered text to right-to-left. Default is False, which renders text left-to-right.
            buttons: A list of buttons to show in the top right corner of the component. Valid options are "share", "copy", "copy_all", or a gr.Button() instance. The "share" button allows the user to share outputs to Hugging Face Spaces Discussions. The "copy" button makes a copy button appear next to each individual chatbot message. The "copy_all" button appears at the component level and allows the user to copy all chatbot messages. Custom gr.Button() instances will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button. By default, "share" and "copy_all" buttons are shown.
            watermark: If provided, this text will be appended to the end of messages copied from the chatbot, after a blank line. Useful for indicating that the message is generated by an AI model.
            avatar_images: Tuple of two avatar image paths or URLs for user and bot (in that order). Pass None for either the user or bot image to skip. Must be within the working directory of the Gradio app or an external URL.
            sanitize_html: If False, will disable HTML sanitization for chatbot messages. This is not recommended, as it can lead to security vulnerabilities.
            render_markdown: If False, will disable Markdown rendering for chatbot messages.
            feedback_options: A list of strings representing the feedback options that will be displayed to the user. The exact case-sensitive strings "Like" and "Dislike" will render as thumb icons, but any other choices will appear under a separate flag icon.
            feedback_value: A list of strings representing the feedback state for entire chat. Only works when type="messages". Each entry in the list corresponds to that assistant message, in order, and the value is the feedback given (e.g. "Like", "Dislike", or any custom feedback option) or None if no feedback was given for that message.
            line_breaks: If True (default), will enable Github-flavored Markdown line breaks in chatbot messages. If False, single new lines will be ignored. Only applies if `render_markdown` is True.
            layout: If "panel", will display the chatbot in a llm style layout. If "bubble", will display the chatbot with message bubbles, with the user and bot messages on alterating sides. Will default to "bubble".
            placeholder: a placeholder message to display in the chatbot when it is empty. Centered vertically and horizontally in the Chatbot. Supports Markdown and HTML. If None, no placeholder is displayed.
            examples: A list of example messages to display in the chatbot before any user/assistant messages are shown. Each example should be a dictionary with an optional "text" key representing the message that should be populated in the Chatbot when clicked, an optional "files" key, whose value should be a list of files to populate in the Chatbot, an optional "icon" key, whose value should be a filepath or URL to an image to display in the example box, and an optional "display_text" key, whose value should be the text to display in the example box. If "display_text" is not provided, the value of "text" will be displayed.
            allow_file_downloads: If True, will show a download button for chatbot messages that contain media. Defaults to True.
            group_consecutive_messages: If True, will display consecutive messages from the same role in the same bubble. If False, will display each message in a separate bubble. Defaults to True.
            allow_tags: If a list of tags is provided, these tags will be preserved in the output chatbot messages, even if `sanitize_html` is `True`. For example, if this list is ["thinking"], the tags `<thinking>` and `</thinking>` will not be removed. If True, all custom tags (non-standard HTML tags) will be preserved. If False, no tags will be preserved. Default value is 'True'.
            reasoning_tags: If provided, a list of tuples of (open_tag, close_tag) strings. Any text between these tags will be extracted and displayed in a separate collapsible message with metadata={"title": "Reasoning"}. For example, [("<thinking>", "</thinking>")] will extract content between <thinking> and </thinking> tags. Each thinking block will be displayed as a separate collapsible message before the main response. If None (default), no automatic extraction is performed.
            like_user_message: If True, will show like/dislike buttons for user messages as well. Defaults to False.
        """
        self.autoscroll = autoscroll
        self.height = height
        self.resizable = resizable
        self.max_height = max_height
        self.min_height = min_height
        self.editable = editable
        self.rtl = rtl
        self.group_consecutive_messages = group_consecutive_messages
        if latex_delimiters is None:
            latex_delimiters = [{"left": "$$", "right": "$$", "display": True}]
        self.latex_delimiters = latex_delimiters
        self.buttons = set_default_buttons(buttons, ["share", "copy", "copy_all"])
        self.render_markdown = render_markdown
        self.watermark = watermark
        self.sanitize_html = sanitize_html
        self.line_breaks = line_breaks
        self.layout = layout
        self.allow_file_downloads = allow_file_downloads
        self.feedback_options = feedback_options
        self.feedback_value = feedback_value
        self.allow_tags = allow_tags if allow_tags else False
        self.reasoning_tags = reasoning_tags
        self.like_user_message = like_user_message
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
        )
        self.avatar_images: list[dict | None] = [None, None]
        if avatar_images is None:
            pass
        else:
            self.avatar_images = [
                self.serve_static_file(avatar_images[0]),
                self.serve_static_file(avatar_images[1]),
            ]
        self.placeholder = placeholder

        self.examples = examples
        self._setup_examples()
        self._value_description = "a list of chat message dictionaries in openai format, e.g. {'role': 'user', 'content': 'Hello'}"

    def _setup_examples(self):
        if self.examples is not None:
            for i, example in enumerate(self.examples):
                if "icon" in example and isinstance(example["icon"], str):
                    example["icon"] = cast(
                        FileDataDict, self.serve_static_file(example["icon"])
                    )
                file_info = example.get("files")
                if file_info is not None and not isinstance(file_info, list):
                    raise Error(
                        "Data incompatible with files format. The 'files' passed should be a list of file paths or URLs."
                    )
                if file_info is not None:
                    for i, file in enumerate(file_info):
                        if isinstance(file, str):
                            orig_name = Path(file).name
                            file_data = self.serve_static_file(file)
                            if file_data is not None:
                                file_data["orig_name"] = orig_name
                                file_data["mime_type"] = client_utils.get_mimetype(
                                    orig_name
                                )
                                file_data = FileDataDict(**file_data)  # type: ignore
                                file_info[i] = file_data

    @staticmethod
    def _check_format(
        messages: list[MessageDict | Message | ChatMessage | NormalizedMessageDict],
    ):
        all_valid = all(
            isinstance(message, dict)
            and "role" in message
            and "content" in message
            or isinstance(message, ChatMessage | Message)
            for message in messages
        )
        if not all_valid:
            raise Error(
                "Data incompatible with messages format. Each message should be a dictionary with 'role' and 'content' keys or a ChatMessage object."
            )

    def _preprocess_content(
        self,
        chat_message: Union[TextMessage, FileMessage, ComponentMessage],
    ) -> NormalizedMessageContent:
        if isinstance(chat_message, FileMessage):
            return cast(FileMessageDict, chat_message.model_dump())
        elif isinstance(chat_message, TextMessage):
            return cast(TextMessageDict, chat_message.model_dump())
        elif isinstance(chat_message, ComponentMessage):
            component_message = cast(ComponentMessageDict, chat_message.model_dump())
            capitalized_component = (
                chat_message.component.upper()
                if chat_message.component in ("json", "html")
                else "Model3D"
                if chat_message.component == "model3d"
                else chat_message.component.capitalize()
            )
            component = import_component_and_data(capitalized_component)
            if component is not None:
                instance = component()  # type: ignore
                if not instance.data_model:
                    payload = chat_message.value
                elif issubclass(instance.data_model, GradioModel):
                    payload = instance.data_model(**chat_message.value)
                elif issubclass(instance.data_model, GradioRootModel):
                    payload = instance.data_model(root=chat_message.value)
                else:
                    payload = chat_message.value
                value = instance.preprocess(payload)
                component_message["instance"] = component(
                    value=value, **chat_message.constructor_args
                )
            return component_message
        else:
            raise ValueError(f"Invalid message for Chatbot component: {chat_message}")

    def preprocess(
        self,
        payload: ChatbotDataMessages | None,
    ) -> list[NormalizedMessageDict]:
        """
        Parameters:
            payload: data as a ChatbotData object
        Returns:
            Passes the value as a list of dictionaries with 'role' and 'content' keys.
        """
        if payload is None:
            return []

        if not isinstance(payload, ChatbotDataMessages):
            raise Error("Data incompatible with the messages format")
        message_dicts = []
        for message in payload.root:
            message_dict = cast(NormalizedMessageDict, message.model_dump())
            message_dict["content"] = [
                self._preprocess_content(content) for content in message.content
            ]
            message_dicts.append(message_dict)
        return message_dicts

    @staticmethod
    def _get_alt_text(chat_message: dict | list | tuple | GradioComponent):
        if isinstance(chat_message, dict):
            return chat_message.get("alt_text")  # type: ignore
        elif not isinstance(chat_message, GradioComponent) and len(chat_message) > 1:
            return chat_message[1]

    @staticmethod
    def _create_file_message(chat_message, filepath):
        mime_type = client_utils.get_mimetype(filepath)

        return FileMessage(
            file=FileData(path=filepath, mime_type=mime_type),
            alt_text=Chatbot._get_alt_text(chat_message),
        )

    def _postprocess_content(
        self,
        chat_message: str
        | FileDataDict
        | GradioComponent
        | ComponentMessage
        | FileData
        | FileMessage
        | ComponentMessage
        | FileMessageDict
        | ComponentMessageDict
        | TextMessageDict,
    ) -> Union[TextMessage, FileMessage, ComponentMessage, None]:
        if isinstance(chat_message, str):
            return TextMessage(text=inspect.cleandoc(chat_message))
        elif isinstance(chat_message, (FileMessage, ComponentMessage)):
            return chat_message
        elif isinstance(chat_message, FileData):
            return FileMessage(file=chat_message)
        elif isinstance(chat_message, GradioComponent):
            chat_message.unrender()
            component = import_component_and_data(type(chat_message).__name__)
            if component:
                chat_message.constructor_args["render"] = False
                component = chat_message.__class__(**chat_message.constructor_args)
                chat_message.constructor_args.pop("value", None)
                config = component.get_config()
                component_name = type(chat_message).__name__.lower()
                value = config.get("value", None)
                # Ensure that file components have value as a list
                if (
                    component_name == "file"
                    and value is not None
                    and not isinstance(value, list)
                ):
                    value = [value]
                return ComponentMessage(
                    component=component_name,
                    value=value,
                    constructor_args=chat_message.constructor_args,
                    props=config,
                )
        elif isinstance(chat_message, dict) and "path" in chat_message:
            filepath = chat_message["path"]
            return self._create_file_message(chat_message, filepath)
        elif isinstance(chat_message, dict) and "file" in chat_message:
            return FileMessage(
                file=FileData(**chat_message["file"]),  # type: ignore
                alt_text=chat_message.get("alt_text"),
            )
        elif isinstance(chat_message, dict) and chat_message.get("type") == "text":
            return TextMessage(**chat_message)  # type: ignore
        elif isinstance(chat_message, dict) and chat_message.get("type") == "component":
            return ComponentMessage(**chat_message)  # type: ignore
        elif isinstance(chat_message, dict) and chat_message.get("type") == "file":
            return FileMessage(
                file=FileData(**chat_message["file"]),  # type: ignore
                alt_text=chat_message.get("alt_text"),
            )
        else:
            raise ValueError(f"Invalid message for Chatbot component: {chat_message}")

    def _postprocess(
        self, message: MessageDict | Message | ChatMessage | NormalizedMessageDict
    ) -> list[Message] | None:
        message = copy.deepcopy(message)
        role = message["role"] if isinstance(message, dict) else message.role  # type: ignore[possibly-unbound-attribute]
        metadata = (
            message.get("metadata") if isinstance(message, dict) else message.metadata  # type: ignore[possibly-unbound-attribute]
        )
        options = (
            message.get("options") if isinstance(message, dict) else message.options  # type: ignore[possibly-unbound-attribute]
        )
        if isinstance(message, dict) and not isinstance(message["content"], list):
            content_ = self._postprocess_content(
                cast(MessageContent, message["content"])
            )
            if not content_:
                return None
            content_postprocessed = [content_]
        elif isinstance(message, dict) and isinstance(message["content"], list):
            content_postprocessed: list[
                Union[TextMessage, FileMessage, ComponentMessage]
            ] = []
            for content_item in cast(list, message["content"]):
                item = self._postprocess_content(content_item)
                if item:
                    content_postprocessed.append(item)
            if not content_postprocessed:
                return None
        elif isinstance(message, ChatMessage):
            if not isinstance(message.content, list):
                content_postprocessed = [self._postprocess_content(message.content)]  # type: ignore
            else:
                content_postprocessed = []
                for content_item in message.content:
                    item = self._postprocess_content(content_item)  # type: ignore
                    if item:
                        content_postprocessed.append(item)
            if not content_postprocessed:
                return None
        elif isinstance(message, Message):
            return [message]
        else:
            raise Error(
                f"Invalid message for Chatbot component: {message}", visible=False
            )
        messages: list[Message] = []
        if self.reasoning_tags:
            non_text_content = [
                item
                for item in content_postprocessed
                if item.type != "text"  # type: ignore
            ]
            for content_item in content_postprocessed:
                if content_item.type == "text":  # type: ignore
                    segments = self._extract_thinking_blocks(
                        content_item.text,  # type: ignore
                        self.reasoning_tags,  # type: ignore
                    )
                    for text, is_thinking, status in segments:
                        if is_thinking:
                            thinking_message = Message(
                                role=role,
                                content=[TextMessage(text=text)],
                                metadata=cast(
                                    MetadataDict,
                                    {"title": "Reasoning", "status": status},
                                ),
                            )
                            messages.append(thinking_message)
                        else:
                            prose_message = Message(
                                role=role,
                                content=[TextMessage(text=text)],
                                metadata=metadata,
                                options=options,
                            )
                            messages.append(prose_message)
            if non_text_content:
                messages.append(
                    Message(
                        role=role,
                        content=non_text_content,  # type: ignore
                        metadata=metadata,
                        options=options,
                    )
                )
        else:
            messages = [
                Message(
                    role=role,
                    content=content_postprocessed,  # type: ignore
                    metadata=metadata,
                    options=options,
                )
            ]
        return messages

    def _extract_thinking_blocks(
        self, content: str, tags: list[tuple[str, str]]
    ) -> list[tuple[str, bool, str]]:
        """
        Extract thinking blocks from content based on provided tags, preserving order.

        Parameters:
            content: The message content to process
            tags: List of (open_tag, close_tag) tuples

        Returns:
            A list of tuples (text, is_thinking, status) in order of appearance
        """
        import re

        patterns = []
        for open_tag, close_tag in tags:
            escaped_open = re.escape(open_tag)
            escaped_close = re.escape(close_tag)
            # match opening tag, and either the closing tag or the end of the string
            patterns.append(f"({escaped_open})(.*?)(?:{escaped_close}|$)")

        combined_pattern = "|".join(patterns)

        segments = []
        last_end = 0
        for match in re.finditer(combined_pattern, content, re.DOTALL):
            if match.start() > last_end:
                prose = content[last_end : match.start()].strip()
                if prose:
                    segments.append([prose, False, "done"])

            thinking = None
            for i in range(1, len(match.groups()), 2):
                if match.group(i + 1) is not None:
                    thinking = match.group(i + 1).strip()
                    break

            if thinking:
                pending = not any(match.group(0).endswith(tag[1]) for tag in tags)
                segments.append([thinking, True, "done" if not pending else "pending"])

            last_end = match.end()

        if last_end < len(content):
            prose = content[last_end:].strip()
            if prose:
                segments.append([prose, False, "done"])

        return segments

    def postprocess(
        self,
        value: list[MessageDict | Message | ChatMessage | NormalizedMessageDict] | None,
    ) -> ChatbotDataMessages:
        """
        Parameters:
            value: Passes the value as a list of dictionaries with 'role' and 'content' keys. The `content` key's value supports everything the `tuples` format supports.
        Returns:
            an object of type ChatbotData
        """
        if value is None:
            return ChatbotDataMessages(root=[])
        self._check_format(value)

        processed_messages = []
        for message in value:
            processed_message = self._postprocess(message)
            if processed_message is not None:
                processed_messages.extend(processed_message)
        return ChatbotDataMessages(root=processed_messages)

    def example_payload(self) -> Any:
        return [
            Message(role="user", content=[TextMessage(text="Hello!")]).model_dump(),
            Message(
                role="assistant", content=[TextMessage(text="How can I help you?")]
            ).model_dump(),
        ]

    def example_value(self) -> Any:
        return [
            Message(role="user", content=[TextMessage(text="Hello!")]).model_dump(),
            Message(
                role="assistant", content=[TextMessage(text="How can I help you?")]
            ).model_dump(),
        ]
