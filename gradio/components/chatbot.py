"""gr.Chatbot() component."""

from __future__ import annotations

import copy
import inspect
import warnings
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    Optional,
    Union,
    cast,
)

from gradio_client import utils as client_utils
from gradio_client.documentation import document
from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from gradio import utils
from gradio.component_meta import ComponentMeta
from gradio.components import (
    Component as GradioComponent,
)
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.events import Events
from gradio.exceptions import Error


class MetadataDict(TypedDict):
    title: Union[str, None]


class Option(TypedDict):
    label: NotRequired[str]
    value: str


class FileDataDict(TypedDict):
    path: str  # server filepath
    url: NotRequired[Optional[str]]  # normalised server url
    size: NotRequired[Optional[int]]  # size in bytes
    orig_name: NotRequired[Optional[str]]  # original filename
    mime_type: NotRequired[Optional[str]]
    is_stream: NotRequired[bool]
    meta: dict[Literal["_type"], Literal["gradio.FileData"]]


class MessageDict(TypedDict):
    content: str | FileDataDict | tuple | Component
    role: Literal["user", "assistant", "system"]
    metadata: NotRequired[MetadataDict]
    options: NotRequired[list[Option]]


class FileMessage(GradioModel):
    file: FileData
    alt_text: Optional[str] = None


class ComponentMessage(GradioModel):
    component: str
    value: Any
    constructor_args: dict[str, Any]
    props: dict[str, Any]


class ChatbotDataTuples(GradioRootModel):
    root: list[
        tuple[
            Union[str, FileMessage, ComponentMessage, None],
            Union[str, FileMessage, ComponentMessage, None],
        ]
    ]


class Metadata(GradioModel):
    title: Optional[str] = None


class Message(GradioModel):
    role: str
    metadata: Metadata = Field(default_factory=Metadata)
    content: Union[str, FileMessage, ComponentMessage]
    options: Optional[list[Option]] = None


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


@dataclass
class ChatMessage:
    role: Literal["user", "assistant", "system"]
    content: str | FileData | Component | FileDataDict | tuple | list
    metadata: MetadataDict | Metadata = field(default_factory=Metadata)
    options: Optional[list[Option]] = None


class ChatbotDataMessages(GradioRootModel):
    root: list[Message]


TupleFormat = Sequence[
    tuple[Union[str, tuple[str], None], Union[str, tuple[str], None]]
    | list[Union[str, tuple[str], None]]
]

if TYPE_CHECKING:
    from gradio.components import Timer


def import_component_and_data(
    component_name: str,
) -> GradioComponent | ComponentMeta | Any | None:
    try:
        for component in utils.get_all_components():
            if component_name == component.__name__ and isinstance(
                component, ComponentMeta
            ):
                return component
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
    Guides: creating-a-chatbot-fast, creating-a-custom-chatbot-with-blocks, agents-and-tool-usage
    """

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
        value: (list[MessageDict | Message] | TupleFormat | Callable | None) = None,
        *,
        type: Literal["messages", "tuples"] | None = None,
        label: str | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        autoscroll: bool = True,
        render: bool = True,
        key: int | str | None = None,
        height: int | str | None = 400,
        resizeable: bool = False,
        max_height: int | str | None = None,
        min_height: int | str | None = None,
        editable: Literal["user", "all"] | None = None,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        rtl: bool = False,
        show_share_button: bool | None = None,
        show_copy_button: bool = False,
        avatar_images: tuple[str | Path | None, str | Path | None] | None = None,
        sanitize_html: bool = True,
        render_markdown: bool = True,
        feedback_options: list[str] | tuple[str, ...] | None = ("Like", "Dislike"),
        feedback_value: Sequence[str | None] | None = None,
        bubble_full_width=None,
        line_breaks: bool = True,
        layout: Literal["panel", "bubble"] | None = None,
        placeholder: str | None = None,
        examples: list[ExampleMessage] | None = None,
        show_copy_all_button=False,
        allow_file_downloads=True,
        group_consecutive_messages: bool = True,
    ):
        """
        Parameters:
            value: Default list of messages to show in chatbot, where each message is of the format {"role": "user", "content": "Help me."}. Role can be one of "user", "assistant", or "system". Content should be either text, or media passed as a Gradio component, e.g. {"content": gr.Image("lion.jpg")}. If callable, the function will be called whenever the app loads to set the initial value of the component.
            type: The format of the messages passed into the chat history parameter of `fn`. If "messages", passes the value as a list of dictionaries with openai-style "role" and "content" keys. The "content" key's value should be one of the following - (1) strings in valid Markdown (2) a dictionary with a "path" key and value corresponding to the file to display or (3) an instance of a Gradio component. At the moment Image, Plot, Video, Gallery, Audio, and HTML are supported. The "role" key should be one of 'user' or 'assistant'. Any other roles will not be displayed in the output. If this parameter is 'tuples', expects a `list[list[str | None | tuple]]`, i.e. a list of lists. The inner list should have 2 elements: the user message and the response message, but this format is deprecated.
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
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If messages exceed the height, the component will scroll.
            resizeable: If True, the component will be resizeable by the user.
            max_height: The maximum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If messages exceed the height, the component will scroll. If messages are shorter than the height, the component will shrink to fit the content. Will not have any effect if `height` is set and is smaller than `max_height`.
            min_height: The minimum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If messages exceed the height, the component will expand to fit the content. Will not have any effect if `height` is set and is larger than `min_height`.
            editable: Allows user to edit messages in the chatbot. If set to "user", allows editing of user messages. If set to "all", allows editing of assistant messages as well.
            latex_delimiters: A list of dicts of the form {"left": open delimiter (str), "right": close delimiter (str), "display": whether to display in newline (bool)} that will be used to render LaTeX expressions. If not provided, `latex_delimiters` is set to `[{ "left": "$$", "right": "$$", "display": True }]`, so only expressions enclosed in $$ delimiters will be rendered as LaTeX, and in a new line. Pass in an empty list to disable LaTeX rendering. For more information, see the [KaTeX documentation](https://katex.org/docs/autorender.html).
            rtl: If True, sets the direction of the rendered text to right-to-left. Default is False, which renders text left-to-right.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_copy_button: If True, will show a copy button for each chatbot message.
            avatar_images: Tuple of two avatar image paths or URLs for user and bot (in that order). Pass None for either the user or bot image to skip. Must be within the working directory of the Gradio app or an external URL.
            sanitize_html: If False, will disable HTML sanitization for chatbot messages. This is not recommended, as it can lead to security vulnerabilities.
            render_markdown: If False, will disable Markdown rendering for chatbot messages.
            feedback_options: A list of strings representing the feedback options that will be displayed to the user. The exact case-sensitive strings "Like" and "Dislike" will render as thumb icons, but any other choices will appear under a separate flag icon.
            feedback_value: A list of strings representing the feedback state for entire chat. Only works when type="messages". Each entry in the list corresponds to that assistant message, in order, and the value is the feedback given (e.g. "Like", "Dislike", or any custom feedback option) or None if no feedback was given for that message.
            bubble_full_width: Deprecated.
            line_breaks: If True (default), will enable Github-flavored Markdown line breaks in chatbot messages. If False, single new lines will be ignored. Only applies if `render_markdown` is True.
            layout: If "panel", will display the chatbot in a llm style layout. If "bubble", will display the chatbot with message bubbles, with the user and bot messages on alterating sides. Will default to "bubble".
            placeholder: a placeholder message to display in the chatbot when it is empty. Centered vertically and horizontally in the Chatbot. Supports Markdown and HTML. If None, no placeholder is displayed.
            examples: A list of example messages to display in the chatbot before any user/assistant messages are shown. Each example should be a dictionary with an optional "text" key representing the message that should be populated in the Chatbot when clicked, an optional "files" key, whose value should be a list of files to populate in the Chatbot, an optional "icon" key, whose value should be a filepath or URL to an image to display in the example box, and an optional "display_text" key, whose value should be the text to display in the example box. If "display_text" is not provided, the value of "text" will be displayed.
            show_copy_all_button: If True, will show a copy all button that copies all chatbot messages to the clipboard.
            allow_file_downloads: If True, will show a download button for chatbot messages that contain media. Defaults to True.
            group_consecutive_messages: If True, will display consecutive messages from the same role in the same bubble. If False, will display each message in a separate bubble. Defaults to True.
        """
        if type is None:
            warnings.warn(
                "You have not specified a value for the `type` parameter. Defaulting to the 'tuples' format for chatbot messages, but this is deprecated and will be removed in a future version of Gradio. Please set type='messages' instead, which uses openai-style dictionaries with 'role' and 'content' keys.",
                UserWarning,
            )
            type = "tuples"
        elif type == "tuples":
            warnings.warn(
                "The 'tuples' format for chatbot messages is deprecated and will be removed in a future version of Gradio. Please set type='messages' instead, which uses openai-style 'role' and 'content' keys.",
                UserWarning,
            )
        if type not in ["messages", "tuples"]:
            raise ValueError(
                f"The `type` parameter must be 'messages' or 'tuples', received: {type}"
            )
        self.type: Literal["tuples", "messages"] = type
        self._setup_data_model()
        self.autoscroll = autoscroll
        self.height = height
        self.resizeable = resizeable
        self.max_height = max_height
        self.min_height = min_height
        self.editable = editable
        self.rtl = rtl
        self.group_consecutive_messages = group_consecutive_messages
        if latex_delimiters is None:
            latex_delimiters = [{"left": "$$", "right": "$$", "display": True}]
        self.latex_delimiters = latex_delimiters
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        self.render_markdown = render_markdown
        self.show_copy_button = show_copy_button
        self.sanitize_html = sanitize_html
        if bubble_full_width is not None:
            warnings.warn(
                "The 'bubble_full_width' parameter is deprecated and will be removed in a future version. This parameter no longer has any effect.",
                DeprecationWarning,
            )
        self.bubble_full_width = None
        self.line_breaks = line_breaks
        self.layout = layout
        self.show_copy_all_button = show_copy_all_button
        self.allow_file_downloads = allow_file_downloads
        self.feedback_options = feedback_options
        self.feedback_value = feedback_value
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

    def _setup_data_model(self):
        if self.type == "messages":
            self.data_model = ChatbotDataMessages
        else:
            self.data_model = ChatbotDataTuples

    def _setup_examples(self):
        if self.examples is not None:
            for i, example in enumerate(self.examples):
                if "icon" in example and isinstance(example["icon"], str):
                    example["icon"] = self.serve_static_file(example["icon"])
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
                                file_data = FileDataDict(**file_data)
                                file_info[i] = file_data

    @staticmethod
    def _check_format(messages: Any, type: Literal["messages", "tuples"]):
        if type == "messages":
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
        elif not all(
            isinstance(message, (tuple, list)) and len(message) == 2
            for message in messages
        ):
            raise Error(
                "Data incompatible with tuples format. Each message should be a list of length 2."
            )

    def _preprocess_content(
        self,
        chat_message: str | FileMessage | ComponentMessage | None,
    ) -> str | GradioComponent | tuple[str | None] | tuple[str | None, str] | None:
        if chat_message is None:
            return None
        elif isinstance(chat_message, FileMessage):
            if chat_message.alt_text is not None:
                return (chat_message.file.path, chat_message.alt_text)
            else:
                return (chat_message.file.path,)
        elif isinstance(chat_message, str):
            return chat_message
        elif isinstance(chat_message, ComponentMessage):
            capitalized_component = (
                chat_message.component.upper()
                if chat_message.component in ("json", "html")
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
                return component(value=value, **chat_message.constructor_args)  # type: ignore
            else:
                raise ValueError(
                    f"Invalid component for Chatbot component: {chat_message.component}"
                )
        else:
            raise ValueError(f"Invalid message for Chatbot component: {chat_message}")

    def _preprocess_messages_tuples(
        self, payload: ChatbotDataTuples
    ) -> list[list[str | tuple[str] | tuple[str, str] | None]]:
        processed_messages = []
        for message_pair in payload.root:
            if not isinstance(message_pair, (tuple, list)):
                raise TypeError(
                    f"Expected a list of lists or list of tuples. Received: {message_pair}"
                )
            if len(message_pair) != 2:
                raise TypeError(
                    f"Expected a list of lists of length 2 or list of tuples of length 2. Received: {message_pair}"
                )
            processed_messages.append(
                [
                    self._preprocess_content(message_pair[0]),
                    self._preprocess_content(message_pair[1]),
                ]
            )
        return processed_messages

    def preprocess(
        self,
        payload: ChatbotDataTuples | ChatbotDataMessages | None,
    ) -> list[list[str | tuple[str] | tuple[str, str] | None]] | list[MessageDict]:
        """
        Parameters:
            payload: data as a ChatbotData object
        Returns:
            If type is 'tuples', passes the messages in the chatbot as a `list[list[str | None | tuple]]`, i.e. a list of lists. The inner list has 2 elements: the user message and the response message. Each message can be (1) a string in valid Markdown, (2) a tuple if there are displayed files: (a filepath or URL to a file, [optional string alt text]), or (3) None, if there is no message displayed. If type is 'messages', passes the value as a list of dictionaries with 'role' and 'content' keys. The `content` key's value supports everything the `tuples` format supports.
        """
        if payload is None:
            return []
        if self.type == "tuples":
            if not isinstance(payload, ChatbotDataTuples):
                raise Error("Data incompatible with the tuples format")
            return self._preprocess_messages_tuples(cast(ChatbotDataTuples, payload))
        if not isinstance(payload, ChatbotDataMessages):
            raise Error("Data incompatible with the messages format")
        message_dicts = []
        for message in payload.root:
            message_dict = cast(MessageDict, message.model_dump())
            message_dict["content"] = self._preprocess_content(message.content)
            message_dicts.append(message_dict)
        return message_dicts

    @staticmethod
    def _get_alt_text(chat_message: dict | list | tuple | GradioComponent):
        if isinstance(chat_message, dict):
            return chat_message.get("alt_text")
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
        | tuple
        | list
        | FileDataDict
        | FileData
        | GradioComponent
        | ComponentMessage
        | None,
    ) -> str | FileMessage | ComponentMessage | None:
        if chat_message is None:
            return None
        if isinstance(chat_message, (FileMessage, ComponentMessage, str)):
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
                return ComponentMessage(
                    component=type(chat_message).__name__.lower(),
                    value=config.get("value", None),
                    constructor_args=chat_message.constructor_args,
                    props=config,
                )
        elif isinstance(chat_message, dict) and "path" in chat_message:
            filepath = chat_message["path"]
            return self._create_file_message(chat_message, filepath)
        elif isinstance(chat_message, (tuple, list)):
            filepath = str(chat_message[0])
            return self._create_file_message(chat_message, filepath)
        else:
            raise ValueError(f"Invalid message for Chatbot component: {chat_message}")

    def _postprocess_messages_tuples(self, value: TupleFormat) -> ChatbotDataTuples:
        processed_messages = []
        for message_pair in value:
            processed_messages.append(
                [
                    self._postprocess_content(message_pair[0]),
                    self._postprocess_content(message_pair[1]),
                ]
            )
        return ChatbotDataTuples(root=processed_messages)

    def _postprocess_message_messages(
        self, message: MessageDict | ChatMessage
    ) -> Message:
        message = copy.deepcopy(message)
        if isinstance(message, dict):
            message["content"] = self._postprocess_content(message["content"])
            msg = Message(**message)  # type: ignore
        elif isinstance(message, ChatMessage):
            message.content = self._postprocess_content(message.content)  # type: ignore
            msg = Message(
                role=message.role,
                content=message.content,  # type: ignore
                metadata=message.metadata,  # type: ignore
                options=message.options,
            )
        elif isinstance(message, Message):
            return message
        else:
            raise Error(
                f"Invalid message for Chatbot component: {message}", visible=False
            )

        msg.content = (
            inspect.cleandoc(msg.content)
            if isinstance(msg.content, str)
            else msg.content
        )
        return msg

    def postprocess(
        self,
        value: TupleFormat | list[MessageDict | Message] | None,
    ) -> ChatbotDataTuples | ChatbotDataMessages:
        """
        Parameters:
            value: If type is `tuples`, expects a `list[list[str | None | tuple]]`, i.e. a list of lists. The inner list should have 2 elements: the user message and the response message. The individual messages can be (1) strings in valid Markdown, (2) tuples if sending files: (a filepath or URL to a file, [optional string alt text]) -- if the file is image/video/audio, it is displayed in the Chatbot, or (3) None, in which case the message is not displayed. If type is 'messages', passes the value as a list of dictionaries with 'role' and 'content' keys. The `content` key's value supports everything the `tuples` format supports.
        Returns:
            an object of type ChatbotData
        """
        data_model = cast(
            Union[type[ChatbotDataTuples], type[ChatbotDataMessages]], self.data_model
        )
        if value is None:
            return data_model(root=[])
        if self.type == "tuples":
            self._check_format(value, "tuples")
            return self._postprocess_messages_tuples(cast(TupleFormat, value))
        self._check_format(value, "messages")
        processed_messages = [
            self._postprocess_message_messages(cast(MessageDict, message))
            for message in value
        ]
        return ChatbotDataMessages(root=processed_messages)

    def example_payload(self) -> Any:
        if self.type == "messages":
            return [
                Message(role="user", content="Hello!").model_dump(),
                Message(role="assistant", content="How can I help you?").model_dump(),
            ]
        return [["Hello!", None]]

    def example_value(self) -> Any:
        if self.type == "messages":
            return [
                Message(role="user", content="Hello!").model_dump(),
                Message(role="assistant", content="How can I help you?").model_dump(),
            ]
        return [["Hello!", None]]
