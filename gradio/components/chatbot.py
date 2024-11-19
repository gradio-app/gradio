"""gr.Chatbot() component."""

from __future__ import annotations

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
    TypedDict,
    Union,
    cast,
)

from gradio_client import utils as client_utils
from gradio_client.documentation import document
from pydantic import Field
from typing_extensions import NotRequired

from gradio import utils
from gradio.component_meta import ComponentMeta
from gradio.components import (
    Component as GradioComponent,
)
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel, GradioRootModel
from gradio.events import Events
from gradio.exceptions import Error
import bleach  # Import bleach for HTML sanitization

# Define allowed tags and attributes for sanitization
ALLOWED_TAGS = bleach.sanitizer.ALLOWED_TAGS + ['br', 'p', 'strong', 'em', 'code']
ALLOWED_ATTRIBUTES = {}

class MetadataDict(TypedDict):
    title: Union[str, None]

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

class ExampleMessage(TypedDict):
    icon: NotRequired[str | FileDataDict]  # filepath or url to an image to be shown in example box
    display_text: NotRequired[str]  # text to be shown in example box. If not provided, main_text will be shown
    text: NotRequired[str]  # text to be added to chatbot when example is clicked
    files: NotRequired[Sequence[str | FileDataDict]]  # list of file paths or URLs to be added to chatbot when example is clicked

@dataclass
class ChatMessage:
    role: Literal["user", "assistant", "system"]
    content: str | FileData | Component | FileDataDict | tuple | list
    metadata: MetadataDict | Metadata = field(default_factory=Metadata)

class ChatbotDataMessages(GradioRootModel):
    root: list[Message]

TupleFormat = list[list[Union[str, tuple[str], tuple[str, str], None]]]

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
    Guides: creating-a-chatbot-fast, creating-a-custom-chatbot-with-block s, agents-and-tool-usage
    """

    EVENTS = [
        Events.change,
        Events.select,
        Events.like,
        Events.retry,
        Events.undo,
        Events.example_select,
        Events.clear,
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
        max_height: int | str | None = None,
        min_height: int | str | None = None,
        latex_delimiters: list[dict[str, str | bool]] | None = None,
        rtl: bool = False,
        show_share_button: bool | None = None,
        show_copy_button: bool = False,
        avatar_images: tuple[str | Path | None, str | Path | None] | None = None,
        sanitize_html: bool = True,
        render_markdown: bool = True,
        bubble_full_width: bool = True,
        line_breaks: bool = True,
        layout: Literal["panel", "bubble"] | None = None,
        placeholder: str | None = None,
        examples: list[ExampleMessage] | None = None,
        show_copy_all_button=False,
        allow_file_downloads=True,
    ):
        if type is None:
            warnings.warn(
                "You have not specified a value for the type parameter. Defaulting to the 'tuples' format for chatbot messages, but this is deprecated and will be removed in a future version of Gradio. Please set type='messages' instead, which uses openai-style 'role' and 'content' keys.",
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
                f"The type parameter must be 'messages' or 'tuples', received: {type}"
            )
        self.type: Literal["tuples", "messages"] = type
        if self.type == "messages":
            self.data_model = ChatbotDataMessages
        else:
            self.data_model = ChatbotDataTuples
        self.autoscroll = autoscroll
        self.height = height
        self.max_height = max_height
        self.min_height = min_height
        self.rtl = rtl
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
        self.bubble_full_width = bubble_full_width
        self.line_breaks = line_breaks
        self.layout = layout
        self.show_copy_all_button = show_copy_all_button
        self.allow_file_downloads = allow_file_downloads
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

        self .examples = examples
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
    def _check_format(messages: list[Any], type: Literal["messages", "tuples"]):
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

    def _sanitize_html_input(self, html: str) -> str:
        return bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES)

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
            return self._sanitize_html_input(chat_message)  # Sanitize HTML input
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
    ) -> (
        list[list[str | tuple[str] | tuple[str, str] | None]] | list[MessageDict] | None
    ):
        if payload is None:
            return payload
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
        if isinstance(message, dict):
            message["content"] = self._postprocess_content(message["content"])
            msg = Message(**message)  # type: ignore
        elif isinstance(message, ChatMessage):
            message.content = self._postprocess_content(message.content)  # type: ignore
            msg = Message(
                role=message.role,
                content=message.content,  # type: ignore
                metadata=message.metadata,  # type: ignore
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
        return ChatbotData ```python
Messages(root=processed_messages)

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
``` ```python
Messages(root=processed_messages)

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
