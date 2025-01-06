"""
This file defines a useful high-level abstraction to build Gradio chatbots: ChatInterface.
"""

from __future__ import annotations

import builtins
import copy
import inspect
import os
import warnings
from collections.abc import AsyncGenerator, Callable, Generator, Sequence
from pathlib import Path
from typing import Literal, Union, cast

import anyio
from gradio_client.documentation import document

from gradio import utils
from gradio.blocks import Blocks
from gradio.components import (
    JSON,
    BrowserState,
    Button,
    Chatbot,
    Component,
    Dataset,
    Markdown,
    MultimodalTextbox,
    State,
    Textbox,
    get_component_instance,
)
from gradio.components.chatbot import (
    ExampleMessage,
    Message,
    MessageDict,
    TupleFormat,
)
from gradio.components.multimodal_textbox import MultimodalPostprocess, MultimodalValue
from gradio.context import get_blocks_context
from gradio.events import Dependency, EditData, SelectData
from gradio.flagging import ChatCSVLogger
from gradio.helpers import create_examples as Examples  # noqa: N812
from gradio.helpers import special_args, update
from gradio.layouts import Accordion, Column, Group, Row
from gradio.routes import Request
from gradio.themes import ThemeClass as Theme


@document()
class ChatInterface(Blocks):
    """
    ChatInterface is Gradio's high-level abstraction for creating chatbot UIs, and allows you to create
    a web-based demo around a chatbot model in a few lines of code. Only one parameter is required: fn, which
    takes a function that governs the response of the chatbot based on the user input and chat history. Additional
    parameters can be used to control the appearance and behavior of the demo.

    Example:
        import gradio as gr

        def echo(message, history):
            return message

        demo = gr.ChatInterface(fn=echo, type="messages", examples=[{"text": "hello", "text": "hola", "text": "merhaba"}], title="Echo Bot")
        demo.launch()
    Demos: chatinterface_random_response, chatinterface_streaming_echo, chatinterface_artifacts
    Guides: creating-a-chatbot-fast, sharing-your-app
    """

    def __init__(
        self,
        fn: Callable,
        *,
        multimodal: bool = False,
        type: Literal["messages", "tuples"] | None = None,
        chatbot: Chatbot | None = None,
        textbox: Textbox | MultimodalTextbox | None = None,
        additional_inputs: str | Component | list[str | Component] | None = None,
        additional_inputs_accordion: str | Accordion | None = None,
        additional_outputs: Component | list[Component] | None = None,
        editable: bool = False,
        examples: list[str] | list[MultimodalValue] | list[list] | None = None,
        example_labels: list[str] | None = None,
        example_icons: list[str] | None = None,
        run_examples_on_click: bool = True,
        cache_examples: bool | None = None,
        cache_mode: Literal["eager", "lazy"] | None = None,
        title: str | None = None,
        description: str | None = None,
        theme: Theme | str | None = None,
        flagging_mode: Literal["never", "manual"] | None = None,
        flagging_options: list[str] | tuple[str, ...] | None = ("Like", "Dislike"),
        flagging_dir: str = ".gradio/flagged",
        css: str | None = None,
        css_paths: str | Path | Sequence[str | Path] | None = None,
        js: str | None = None,
        head: str | None = None,
        head_paths: str | Path | Sequence[str | Path] | None = None,
        analytics_enabled: bool | None = None,
        autofocus: bool = True,
        autoscroll: bool = True,
        submit_btn: str | bool | None = True,
        stop_btn: str | bool | None = True,
        concurrency_limit: int | None | Literal["default"] = "default",
        delete_cache: tuple[int, int] | None = None,
        show_progress: Literal["full", "minimal", "hidden"] = "minimal",
        fill_height: bool = True,
        fill_width: bool = False,
        api_name: str | Literal[False] = "chat",
        save_history: bool = False,
    ):
        """
        Parameters:
            fn: the function to wrap the chat interface around. Normally (assuming `type` is set to "messages"), the function should accept two parameters: a `str` representing the input message and `list` of openai-style dictionaries: {"role": "user" | "assistant", "content": `str` | {"path": `str`} | `gr.Component`} representing the chat history. The function should return/yield a `str` (for a simple message), a supported Gradio component (e.g. gr.Image to return an image), a `dict` (for a complete openai-style message response), or a `list` of such messages.
            multimodal: if True, the chat interface will use a `gr.MultimodalTextbox` component for the input, which allows for the uploading of multimedia files. If False, the chat interface will use a gr.Textbox component for the input. If this is True, the first argument of `fn` should accept not a `str` message but a `dict` message with keys "text" and "files"
            type: The format of the messages passed into the chat history parameter of `fn`. If "messages", passes the history as a list of dictionaries with openai-style "role" and "content" keys. The "content" key's value should be one of the following - (1) strings in valid Markdown (2) a dictionary with a "path" key and value corresponding to the file to display or (3) an instance of a Gradio component: at the moment gr.Image, gr.Plot, gr.Video, gr.Gallery, gr.Audio, and gr.HTML are supported. The "role" key should be one of 'user' or 'assistant'. Any other roles will not be displayed in the output. If this parameter is 'tuples' (deprecated), passes the chat history as a `list[list[str | None | tuple]]`, i.e. a list of lists. The inner list should have 2 elements: the user message and the response message.
            chatbot: an instance of the gr.Chatbot component to use for the chat interface, if you would like to customize the chatbot properties. If not provided, a default gr.Chatbot component will be created.
            textbox: an instance of the gr.Textbox or gr.MultimodalTextbox component to use for the chat interface, if you would like to customize the textbox properties. If not provided, a default gr.Textbox or gr.MultimodalTextbox component will be created.
            editable: if True, users can edit past messages to regenerate responses.
            additional_inputs: an instance or list of instances of gradio components (or their string shortcuts) to use as additional inputs to the chatbot. If the components are not already rendered in a surrounding Blocks, then the components will be displayed under the chatbot, in an accordion. The values of these components will be passed into `fn` as arguments in order after the chat history.
            additional_inputs_accordion: if a string is provided, this is the label of the `gr.Accordion` to use to contain additional inputs. A `gr.Accordion` object can be provided as well to configure other properties of the container holding the additional inputs. Defaults to a `gr.Accordion(label="Additional Inputs", open=False)`. This parameter is only used if `additional_inputs` is provided.
            additional_outputs: an instance or list of instances of gradio components to use as additional outputs from the chat function. These must be components that are already defined in the same Blocks scope. If provided, the chat function should return additional values for these components. See $demo/chatinterface_artifacts.
            examples: sample inputs for the function; if provided, appear within the chatbot and can be clicked to populate the chatbot input. Should be a list of strings representing text-only examples, or a list of dictionaries (with keys `text` and `files`) representing multimodal examples. If `additional_inputs` are provided, the examples must be a list of lists, where the first element of each inner list is the string or dictionary example message and the remaining elements are the example values for the additional inputs -- in this case, the examples will appear under the chatbot.
            example_labels: labels for the examples, to be displayed instead of the examples themselves. If provided, should be a list of strings with the same length as the examples list. Only applies when examples are displayed within the chatbot (i.e. when `additional_inputs` is not provided).
            example_icons: icons for the examples, to be displayed above the examples. If provided, should be a list of string URLs or local paths with the same length as the examples list. Only applies when examples are displayed within the chatbot (i.e. when `additional_inputs` is not provided).
            cache_examples: if True, caches examples in the server for fast runtime in examples. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
            cache_mode: if "eager", all examples are cached at app launch. If "lazy", examples are cached for all users after the first use by any user of the app. If None, will use the GRADIO_CACHE_MODE environment variable if defined, or default to "eager".
            run_examples_on_click: if True, clicking on an example will run the example through the chatbot fn and the response will be displayed in the chatbot. If False, clicking on an example will only populate the chatbot input with the example message. Has no effect if `cache_examples` is True
            title: a title for the interface; if provided, appears above chatbot in large font. Also used as the tab title when opened in a browser window.
            description: a description for the interface; if provided, appears above the chatbot and beneath the title in regular font. Accepts Markdown and HTML content.
            theme: a Theme object or a string representing a theme. If a string, will look for a built-in theme with that name (e.g. "soft" or "default"), or will attempt to load a theme from the Hugging Face Hub (e.g. "gradio/monochrome"). If None, will use the Default theme.
            flagging_mode: one of "never", "manual". If "never", users will not see a button to flag an input and output. If "manual", users will see a button to flag.
            flagging_options: a list of strings representing the options that users can choose from when flagging a message. Defaults to ["Like", "Dislike"]. These two case-sensitive strings will render as "thumbs up" and "thumbs down" icon respectively next to each bot message, but any other strings appear under a separate flag icon.
            flagging_dir: path to the the directory where flagged data is stored. If the directory does not exist, it will be created.
            css: Custom css as a code string. This css will be included in the demo webpage.
            css_paths: Custom css as a pathlib.Path to a css file or a list of such paths. This css files will be read, concatenated, and included in the demo webpage. If the `css` parameter is also set, the css from `css` will be included first.
            js: Custom js as a code string. The custom js should be in the form of a single js function. This function will automatically be executed when the page loads. For more flexibility, use the head parameter to insert js inside <script> tags.
            head: Custom html code to insert into the head of the demo webpage. This can be used to add custom meta tags, multiple scripts, stylesheets, etc. to the page.
            head_paths: Custom html code as a pathlib.Path to a html file or a list of such paths. This html files will be read, concatenated, and included in the head of the demo webpage. If the `head` parameter is also set, the html from `head` will be included first.
            analytics_enabled: whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable if defined, or default to True.
            autofocus: if True, autofocuses to the textbox when the page loads.
            autoscroll: If True, will automatically scroll to the bottom of the chatbot when a new message appears, unless the user scrolls up. If False, will not scroll to the bottom of the chatbot automatically.
            submit_btn: If True, will show a submit button with a submit icon within the textbox. If a string, will use that string as the submit button text in place of the icon. If False, will not show a submit button.
            stop_btn: If True, will show a button with a stop icon during generator executions, to stop generating. If a string, will use that string as the submit button text in place of the stop icon. If False, will not show a stop button.
            concurrency_limit: if set, this is the maximum number of chatbot submissions that can be running simultaneously. Can be set to None to mean no limit (any number of chatbot submissions can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `.queue()`, which is 1 by default).
            delete_cache: a tuple corresponding [frequency, age] both expressed in number of seconds. Every `frequency` seconds, the temporary files created by this Blocks instance will be deleted if more than `age` seconds have passed since the file was created. For example, setting this to (86400, 86400) will delete temporary files every day. The cache will be deleted entirely when the server restarts. If None, no cache deletion will occur.
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            fill_height: if True, the chat interface will expand to the height of window.
            fill_width: Whether to horizontally expand to fill container fully. If False, centers and constrains app to a maximum width.
            api_name: the name of the API endpoint to use for the chat interface. Defaults to "chat". Set to False to disable the API endpoint.
            save_history: if True, will save the chat history to the browser's local storage and display previous conversations in a side panel.
        """
        super().__init__(
            analytics_enabled=analytics_enabled,
            mode="chat_interface",
            title=title or "Gradio",
            theme=theme,
            css=css,
            css_paths=css_paths,
            js=js,
            head=head,
            head_paths=head_paths,
            fill_height=fill_height,
            fill_width=fill_width,
            delete_cache=delete_cache,
        )
        self.api_name = api_name
        self.type = type
        self.multimodal = multimodal
        self.concurrency_limit = concurrency_limit
        if isinstance(fn, ChatInterface):
            self.fn = fn.fn
        else:
            self.fn = fn
        self.is_async = inspect.iscoroutinefunction(
            self.fn
        ) or inspect.isasyncgenfunction(self.fn)
        self.is_generator = inspect.isgeneratorfunction(
            self.fn
        ) or inspect.isasyncgenfunction(self.fn)
        self.provided_chatbot = chatbot is not None
        self.examples = examples
        self.examples_messages = self._setup_example_messages(
            examples, example_labels, example_icons
        )
        self.run_examples_on_click = run_examples_on_click
        self.cache_examples = cache_examples
        self.cache_mode = cache_mode
        self.editable = editable
        self.fill_height = fill_height
        self.autoscroll = autoscroll
        self.autofocus = autofocus
        self.title = title
        self.description = description
        self.show_progress = show_progress
        if save_history and not type == "messages":
            raise ValueError("save_history is only supported for type='messages'")
        self.save_history = save_history
        self.additional_inputs = [
            get_component_instance(i)
            for i in utils.none_or_singleton_to_list(additional_inputs)
        ]
        self.additional_outputs = utils.none_or_singleton_to_list(additional_outputs)
        if additional_inputs_accordion is None:
            self.additional_inputs_accordion_params = {
                "label": "Additional Inputs",
                "open": False,
            }
        elif isinstance(additional_inputs_accordion, str):
            self.additional_inputs_accordion_params = {
                "label": additional_inputs_accordion
            }
        elif isinstance(additional_inputs_accordion, Accordion):
            self.additional_inputs_accordion_params = (
                additional_inputs_accordion.recover_kwargs(
                    additional_inputs_accordion.get_config()
                )
            )
        else:
            raise ValueError(
                f"The `additional_inputs_accordion` parameter must be a string or gr.Accordion, not {builtins.type(additional_inputs_accordion)}"
            )
        self._additional_inputs_in_examples = False
        if self.additional_inputs and self.examples is not None:
            for example in self.examples:
                if not isinstance(example, list):
                    raise ValueError(
                        "Examples must be a list of lists when additional inputs are provided."
                    )
                for idx, example_for_input in enumerate(example):
                    if example_for_input is not None and idx > 0:
                        self._additional_inputs_in_examples = True
                        break
                if self._additional_inputs_in_examples:
                    break

        if flagging_mode is None:
            flagging_mode = os.getenv("GRADIO_CHAT_FLAGGING_MODE", "never")  # type: ignore
        if flagging_mode in ["manual", "never"]:
            self.flagging_mode = flagging_mode
        else:
            raise ValueError(
                "Invalid value for `flagging_mode` parameter."
                "Must be: 'manual' or 'never'."
            )
        self.flagging_options = flagging_options
        self.flagging_dir = flagging_dir

        with self:
            self.saved_conversations = BrowserState(
                [], storage_key=f"_saved_conversations_{self._id}"
            )
            self.conversation_id = State(None)
            self.saved_input = State()  # Stores the most recent user message
            self.null_component = State()  # Used to discard unneeded values

            with Column():
                self._render_header()
                with Row():
                    self._render_history_area()
                    with Column(scale=6):
                        self._render_chatbot_area(
                            chatbot, textbox, submit_btn, stop_btn
                        )
                self._render_footer()
                self._setup_events()

    def _render_header(self):
        if self.title:
            Markdown(
                f"<h1 style='text-align: center; margin-bottom: 1rem'>{self.title}</h1>"
            )
        if self.description:
            Markdown(self.description)

    def _render_history_area(self):
        if self.save_history:
            with Column(scale=1, min_width=100):
                self.new_chat_button = Button(
                    "New chat",
                    variant="primary",
                    size="md",
                    icon=utils.get_icon_path("plus.svg"),
                )
                self.chat_history_dataset = Dataset(
                    components=[Textbox(visible=False)],
                    show_label=False,
                    layout="table",
                    type="index",
                )

    def _render_chatbot_area(
        self,
        chatbot: Chatbot | None,
        textbox: Textbox | MultimodalTextbox | None,
        submit_btn: str | bool | None,
        stop_btn: str | bool | None,
    ):
        if chatbot:
            if self.type:
                if self.type != chatbot.type:
                    warnings.warn(
                        "The type of the gr.Chatbot does not match the type of the gr.ChatInterface."
                        f"The type of the gr.ChatInterface, '{self.type}', will be used."
                    )
                    chatbot.type = cast(Literal["messages", "tuples"], self.type)
                    chatbot._setup_data_model()
            else:
                warnings.warn(
                    f"The gr.ChatInterface was not provided with a type, so the type of the gr.Chatbot, '{chatbot.type}', will be used."
                )
                self.type = chatbot.type
            self.chatbot = cast(Chatbot, get_component_instance(chatbot, render=True))
            if self.chatbot.examples and self.examples_messages:
                warnings.warn(
                    "The ChatInterface already has examples set. The examples provided in the chatbot will be ignored."
                )
            self.chatbot.examples = (
                self.examples_messages
                if not self._additional_inputs_in_examples
                else None
            )
            self.chatbot._setup_examples()
        else:
            self.type = self.type or "tuples"
            self.chatbot = Chatbot(
                label="Chatbot",
                scale=1,
                height=400 if self.fill_height else None,
                type=cast(Literal["messages", "tuples"], self.type),
                autoscroll=self.autoscroll,
                examples=self.examples_messages
                if not self._additional_inputs_in_examples
                else None,
            )
        with Group():
            with Row():
                if textbox:
                    textbox.show_label = False
                    textbox_ = get_component_instance(textbox, render=True)
                    if not isinstance(textbox_, (Textbox, MultimodalTextbox)):
                        raise TypeError(
                            f"Expected a gr.Textbox or gr.MultimodalTextbox component, but got {builtins.type(textbox_)}"
                        )
                    self.textbox = textbox_
                else:
                    textbox_component = (
                        MultimodalTextbox if self.multimodal else Textbox
                    )
                    self.textbox = textbox_component(
                        show_label=False,
                        label="Message",
                        placeholder="Type a message...",
                        scale=7,
                        autofocus=self.autofocus,
                        submit_btn=submit_btn,
                        stop_btn=stop_btn,
                    )

        # Hide the stop button at the beginning, and show it with the given value during the generator execution.
        self.original_stop_btn = self.textbox.stop_btn
        self.textbox.stop_btn = False

        self.chatbot_state = State(self.chatbot.value if self.chatbot.value else [])
        self.fake_api_btn = Button("Fake API", visible=False)
        self.api_response = JSON(
            label="Response", visible=False
        )  # Used to store the response from the API call

    def _render_footer(self):
        if self.examples:
            self.examples_handler = Examples(
                examples=self.examples,
                inputs=[self.textbox] + self.additional_inputs,
                outputs=self.chatbot,
                fn=self._examples_stream_fn if self.is_generator else self._examples_fn,
                cache_examples=self.cache_examples,
                cache_mode=cast(Literal["eager", "lazy"], self.cache_mode),
                visible=self._additional_inputs_in_examples,
                preprocess=self._additional_inputs_in_examples,
            )

        any_unrendered_inputs = any(
            not inp.is_rendered for inp in self.additional_inputs
        )
        if self.additional_inputs and any_unrendered_inputs:
            with Accordion(**self.additional_inputs_accordion_params):  # type: ignore
                for input_component in self.additional_inputs:
                    if not input_component.is_rendered:
                        input_component.render()

    def _setup_example_messages(
        self,
        examples: list[str] | list[MultimodalValue] | list[list] | None,
        example_labels: list[str] | None = None,
        example_icons: list[str] | None = None,
    ) -> list[ExampleMessage]:
        examples_messages = []
        if examples:
            for index, example in enumerate(examples):
                if isinstance(example, list):
                    example = example[0]
                example_message: ExampleMessage = {}
                if isinstance(example, str):
                    example_message["text"] = example
                elif isinstance(example, dict):
                    example_message["text"] = example.get("text", "")
                    example_message["files"] = example.get("files", [])
                if example_labels:
                    example_message["display_text"] = example_labels[index]
                if self.multimodal:
                    example_files = example_message.get("files")
                    if not example_files:
                        if example_icons:
                            example_message["icon"] = example_icons[index]
                        else:
                            example_message["icon"] = {
                                "path": "",
                                "url": None,
                                "orig_name": None,
                                "mime_type": "text",  # for internal use, not a valid mime type
                                "meta": {"_type": "gradio.FileData"},
                            }
                    elif example_icons:
                        example_message["icon"] = example_icons[index]
                examples_messages.append(example_message)
        return examples_messages

    def _generate_chat_title(self, conversation: list[MessageDict]) -> str:
        """
        Generate a title for a conversation by taking the first user message that is a string
        and truncating it to 40 characters. If files are present, add a 📎 to the title.
        """
        title = ""
        for message in conversation:
            if message["role"] == "user":
                if isinstance(message["content"], str):
                    title += message["content"]
                    break
                else:
                    title += "📎 "
        if len(title) > 40:
            title = title[:40] + "..."
        return title or "Conversation"

    def _save_conversation(
        self,
        index: int | None,
        conversation: list[MessageDict],
        saved_conversations: list[list[MessageDict]],
    ):
        if self.save_history:
            if index is not None:
                saved_conversations[index] = conversation
            else:
                saved_conversations.append(conversation)
                index = len(saved_conversations) - 1
        return index, saved_conversations

    def _delete_conversation(
        self,
        index: int | None,
        saved_conversations: list[list[MessageDict]],
    ):
        if index is not None:
            saved_conversations.pop(index)
        return None, saved_conversations

    def _load_chat_history(self, conversations):
        return Dataset(
            samples=[
                [self._generate_chat_title(conv)]
                for conv in conversations or []
                if conv
            ]
        )

    def _load_conversation(
        self,
        index: int,
        conversations: list[list[MessageDict]],
    ):
        return (
            index,
            Chatbot(
                value=conversations[index],  # type: ignore
                feedback_value=[],
            ),
        )

    def _setup_events(self) -> None:
        from gradio import on

        submit_triggers = [self.textbox.submit, self.chatbot.retry]
        submit_fn = self._stream_fn if self.is_generator else self._submit_fn
        if hasattr(self.fn, "zerogpu"):
            submit_fn.__func__.zerogpu = self.fn.zerogpu  # type: ignore

        synchronize_chat_state_kwargs = {
            "fn": lambda x: x,
            "inputs": [self.chatbot],
            "outputs": [self.chatbot_state],
            "show_api": False,
            "queue": False,
        }
        submit_fn_kwargs = {
            "fn": submit_fn,
            "inputs": [self.saved_input, self.chatbot_state] + self.additional_inputs,
            "outputs": [self.null_component, self.chatbot] + self.additional_outputs,
            "show_api": False,
            "concurrency_limit": cast(
                Union[int, Literal["default"], None], self.concurrency_limit
            ),
            "show_progress": cast(
                Literal["full", "minimal", "hidden"], self.show_progress
            ),
        }
        save_fn_kwargs = {
            "fn": self._save_conversation,
            "inputs": [
                self.conversation_id,
                self.chatbot_state,
                self.saved_conversations,
            ],
            "outputs": [self.conversation_id, self.saved_conversations],
            "show_api": False,
            "queue": False,
        }

        submit_event = (
            self.textbox.submit(
                self._clear_and_save_textbox,
                [self.textbox],
                [self.textbox, self.saved_input],
                show_api=False,
                queue=False,
            )
            .then(  # The reason we do this outside of the submit_fn is that we want to update the chatbot UI with the user message immediately, before the submit_fn is called
                self._append_message_to_history,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                show_api=False,
                queue=False,
            )
            .then(**submit_fn_kwargs)
        )
        submit_event.then(**synchronize_chat_state_kwargs).then(
            lambda: update(value=None, interactive=True),
            None,
            self.textbox,
            show_api=False,
        ).then(**save_fn_kwargs)

        # Creates the "/chat" API endpoint
        self.fake_api_btn.click(
            submit_fn,
            [self.textbox, self.chatbot_state] + self.additional_inputs,
            [self.api_response, self.chatbot_state] + self.additional_outputs,
            api_name=cast(Union[str, Literal[False]], self.api_name),
            concurrency_limit=cast(
                Union[int, Literal["default"], None], self.concurrency_limit
            ),
            postprocess=False,
        )

        if (
            isinstance(self.chatbot, Chatbot)
            and self.examples
            and not self._additional_inputs_in_examples
        ):
            if self.cache_examples or self.run_examples_on_click:
                example_select_event = self.chatbot.example_select(
                    self.example_clicked,
                    None,
                    [self.chatbot, self.saved_input],
                    show_api=False,
                )
                if not self.cache_examples:
                    example_select_event = example_select_event.then(**submit_fn_kwargs)
                example_select_event.then(**synchronize_chat_state_kwargs)
            else:
                self.chatbot.example_select(
                    self.example_populated,
                    None,
                    [self.textbox],
                    show_api=False,
                )

        retry_event = (
            self.chatbot.retry(
                self._pop_last_user_message,
                [self.chatbot_state],
                [self.chatbot_state, self.saved_input],
                show_api=False,
                queue=False,
            )
            .then(
                self._append_message_to_history,
                [self.saved_input, self.chatbot_state],
                [self.chatbot],
                show_api=False,
                queue=False,
            )
            .then(
                lambda: update(interactive=False, placeholder=""),
                outputs=[self.textbox],
                show_api=False,
            )
            .then(**submit_fn_kwargs)
        )
        retry_event.then(**synchronize_chat_state_kwargs).then(
            lambda: update(interactive=True),
            outputs=[self.textbox],
            show_api=False,
        ).then(**save_fn_kwargs)

        self._setup_stop_events(submit_triggers, [submit_event, retry_event])

        self.chatbot.undo(
            self._pop_last_user_message,
            [self.chatbot],
            [self.chatbot, self.textbox],
            show_api=False,
            queue=False,
        ).then(**synchronize_chat_state_kwargs).then(**save_fn_kwargs)

        self.chatbot.option_select(
            self.option_clicked,
            [self.chatbot],
            [self.chatbot, self.saved_input],
            show_api=False,
        ).then(**submit_fn_kwargs).then(**synchronize_chat_state_kwargs).then(
            **save_fn_kwargs
        )

        self.chatbot.clear(**synchronize_chat_state_kwargs).then(
            self._delete_conversation,
            [self.conversation_id, self.saved_conversations],
            [self.conversation_id, self.saved_conversations],
            show_api=False,
            queue=False,
        )

        if self.editable:
            self.chatbot.edit(
                self._edit_message,
                [self.chatbot],
                [self.chatbot, self.chatbot_state, self.saved_input],
                show_api=False,
            ).success(**submit_fn_kwargs).success(**synchronize_chat_state_kwargs).then(
                **save_fn_kwargs
            )

        if self.save_history:
            self.new_chat_button.click(
                lambda: (None, []),
                None,
                [self.conversation_id, self.chatbot],
                show_api=False,
                queue=False,
            ).then(
                lambda x: x,
                [self.chatbot],
                [self.chatbot_state],
                show_api=False,
                queue=False,
            )

            on(
                triggers=[self.load, self.saved_conversations.change],
                fn=self._load_chat_history,
                inputs=[self.saved_conversations],
                outputs=[self.chat_history_dataset],
                show_api=False,
                queue=False,
            )

            self.chat_history_dataset.click(
                lambda: [],
                None,
                [self.chatbot],
                show_api=False,
                queue=False,
                show_progress="hidden",
            ).then(
                self._load_conversation,
                [self.chat_history_dataset, self.saved_conversations],
                [self.conversation_id, self.chatbot],
                show_api=False,
                queue=False,
                show_progress="hidden",
            ).then(**synchronize_chat_state_kwargs)

        if self.flagging_mode != "never":
            flagging_callback = ChatCSVLogger()
            flagging_callback.setup(self.flagging_dir)
            self.chatbot.feedback_options = self.flagging_options
            self.chatbot.like(flagging_callback.flag, self.chatbot)

    def _setup_stop_events(
        self, event_triggers: list[Callable], events_to_cancel: list[Dependency]
    ) -> None:
        textbox_component = MultimodalTextbox if self.multimodal else Textbox
        if self.is_generator:
            original_submit_btn = self.textbox.submit_btn
            for event_trigger in event_triggers:
                event_trigger(
                    utils.async_lambda(
                        lambda: textbox_component(
                            submit_btn=False,
                            stop_btn=self.original_stop_btn,
                        )
                    ),
                    None,
                    [self.textbox],
                    show_api=False,
                    queue=False,
                )
            for event_to_cancel in events_to_cancel:
                event_to_cancel.then(
                    utils.async_lambda(
                        lambda: textbox_component(
                            submit_btn=original_submit_btn, stop_btn=False
                        )
                    ),
                    None,
                    [self.textbox],
                    show_api=False,
                    queue=False,
                )
            self.textbox.stop(
                None,
                None,
                None,
                cancels=events_to_cancel,  # type: ignore
                show_api=False,
            )

    def _clear_and_save_textbox(
        self,
        message: str | MultimodalPostprocess,
    ) -> tuple[
        Textbox | MultimodalTextbox,
        str | MultimodalPostprocess,
    ]:
        return (
            type(self.textbox)("", interactive=False, placeholder=""),
            message,
        )

    @staticmethod
    def _messages_to_tuples(history_messages: list[MessageDict]) -> TupleFormat:
        history_tuples = []
        for message in history_messages:
            if message["role"] == "user":
                history_tuples.append((message["content"], None))
            elif history_tuples and history_tuples[-1][1] is None:
                history_tuples[-1] = (history_tuples[-1][0], message["content"])
            else:
                history_tuples.append((None, message["content"]))
        return history_tuples

    @staticmethod
    def _tuples_to_messages(history_tuples: TupleFormat) -> list[MessageDict]:
        history_messages = []
        for message_tuple in history_tuples:
            if message_tuple[0]:
                history_messages.append({"role": "user", "content": message_tuple[0]})
            if message_tuple[1]:
                history_messages.append(
                    {"role": "assistant", "content": message_tuple[1]}
                )
        return history_messages

    def _append_message_to_history(
        self,
        message: MessageDict | Message | str | Component | MultimodalPostprocess | list,
        history: list[MessageDict] | TupleFormat,
        role: Literal["user", "assistant"] = "user",
    ) -> list[MessageDict] | TupleFormat:
        message_dicts = self._message_as_message_dict(message, role)
        if self.type == "tuples":
            history = self._tuples_to_messages(history)  # type: ignore
        else:
            history = copy.deepcopy(history)
        history.extend(message_dicts)  # type: ignore
        if self.type == "tuples":
            history = self._messages_to_tuples(history)  # type: ignore
        return history

    def _message_as_message_dict(
        self,
        message: MessageDict | Message | str | Component | MultimodalPostprocess | list,
        role: Literal["user", "assistant"],
    ) -> list[MessageDict]:
        """
        Converts a user message, example message, or response from the chat function to a
        list of MessageDict objects that can be appended to the chat history.
        """
        message_dicts = []
        if not isinstance(message, list):
            message = [message]
        for msg in message:
            if isinstance(msg, Message):
                message_dicts.append(msg.model_dump())
            elif isinstance(msg, (str, Component)):
                message_dicts.append({"role": role, "content": msg})
            elif (
                isinstance(msg, dict) and "content" in msg
            ):  # in MessageDict format already
                msg["role"] = role
                message_dicts.append(msg)
            else:  # in MultimodalPostprocess format
                for x in msg.get("files", []):
                    if isinstance(x, dict):
                        x = x.get("path")
                    message_dicts.append({"role": role, "content": (x,)})
                if msg["text"] is None or not isinstance(msg["text"], str):
                    pass
                else:
                    message_dicts.append({"role": role, "content": msg["text"]})
        return message_dicts

    async def _submit_fn(
        self,
        message: str | MultimodalPostprocess,
        history: TupleFormat | list[MessageDict],
        request: Request,
        *args,
    ) -> tuple:
        inputs, _, _ = special_args(
            self.fn, inputs=[message, history, *args], request=request
        )
        if self.is_async:
            response = await self.fn(*inputs)
        else:
            response = await anyio.to_thread.run_sync(
                self.fn, *inputs, limiter=self.limiter
            )
        if self.additional_outputs:
            response, *additional_outputs = response
        else:
            additional_outputs = None
        history = self._append_message_to_history(message, history, "user")
        history = self._append_message_to_history(response, history, "assistant")
        if additional_outputs:
            return response, history, *additional_outputs
        return response, history

    async def _stream_fn(
        self,
        message: str | MultimodalPostprocess,
        history: TupleFormat | list[MessageDict],
        request: Request,
        *args,
    ) -> AsyncGenerator[
        tuple,
        None,
    ]:
        inputs, _, _ = special_args(
            self.fn, inputs=[message, history, *args], request=request
        )
        if self.is_async:
            generator = self.fn(*inputs)
        else:
            generator = await anyio.to_thread.run_sync(
                self.fn, *inputs, limiter=self.limiter
            )
            generator = utils.SyncToAsyncIterator(generator, self.limiter)

        history = self._append_message_to_history(message, history, "user")
        additional_outputs = None
        try:
            first_response = await utils.async_iteration(generator)
            if self.additional_outputs:
                first_response, *additional_outputs = first_response
            history_ = self._append_message_to_history(
                first_response, history, "assistant"
            )
            if not additional_outputs:
                yield first_response, history_
            else:
                yield first_response, history_, *additional_outputs
        except StopIteration:
            yield None, history
        async for response in generator:
            if self.additional_outputs:
                response, *additional_outputs = response
            history_ = self._append_message_to_history(response, history, "assistant")
            if not additional_outputs:
                yield response, history_
            else:
                yield response, history_, *additional_outputs

    def option_clicked(
        self, history: list[MessageDict], option: SelectData
    ) -> tuple[TupleFormat | list[MessageDict], str | MultimodalPostprocess]:
        """
        When an option is clicked, the chat history is appended with the option value.
        The saved input value is also set to option value. Note that event can only
        be called if self.type is "messages" since options are only available for this
        chatbot type.
        """
        history.append({"role": "user", "content": option.value})
        return history, option.value

    def _flatten_example_files(self, example: SelectData):
        """
        Returns an example with the files flattened to just the file path.
        Also ensures that the `files` key is always present in the example.
        """
        example.value["files"] = [f["path"] for f in example.value.get("files", [])]
        return example

    def example_populated(self, example: SelectData):
        if self.multimodal:
            example = self._flatten_example_files(example)
            return example.value
        else:
            return example.value["text"]

    def _edit_message(
        self, history: list[MessageDict] | TupleFormat, edit_data: EditData
    ) -> tuple[
        list[MessageDict] | TupleFormat,
        list[MessageDict] | TupleFormat,
        str | MultimodalPostprocess,
    ]:
        if isinstance(edit_data.index, (list, tuple)):
            history = history[: edit_data.index[0]]
        else:
            history = history[: edit_data.index]
        return history, history, edit_data.value

    def example_clicked(
        self, example: SelectData
    ) -> Generator[
        tuple[TupleFormat | list[MessageDict], str | MultimodalPostprocess], None, None
    ]:
        """
        When an example is clicked, the chat history (and saved input) is initially set only
        to the example message. Then, if example caching is enabled, the cached response is loaded
        and added to the chat history as well.
        """
        history = self._append_message_to_history(example.value, [], "user")
        example = self._flatten_example_files(example)
        message = example.value if self.multimodal else example.value["text"]
        yield history, message
        if self.cache_examples:
            history = self.examples_handler.load_from_cache(example.index)[0].root
            yield history, message

    def _process_example(
        self, message: ExampleMessage | str, response: MessageDict | str | None
    ):
        result = []
        if self.multimodal:
            message = cast(ExampleMessage, message)
            if self.type == "tuples":
                for file in message.get("files", []):
                    result.append([file, None])
                if "text" in message:
                    result.append([message["text"], None])
                result[-1][1] = response
            else:
                for file in message.get("files", []):
                    if isinstance(file, dict):
                        file = file.get("path")
                    result.append({"role": "user", "content": (file,)})
                if "text" in message:
                    result.append({"role": "user", "content": message["text"]})
                result.append({"role": "assistant", "content": response})
        else:
            message = cast(str, message)
            if self.type == "tuples":
                result = [[message, response]]
            else:
                result = [
                    {"role": "user", "content": message},
                    {"role": "assistant", "content": response},
                ]
        return result

    async def _examples_fn(
        self, message: ExampleMessage | str, *args
    ) -> TupleFormat | list[MessageDict]:
        inputs, _, _ = special_args(self.fn, inputs=[message, [], *args], request=None)
        if self.is_async:
            response = await self.fn(*inputs)
        else:
            response = await anyio.to_thread.run_sync(
                self.fn, *inputs, limiter=self.limiter
            )
        return self._process_example(message, response)  # type: ignore

    async def _examples_stream_fn(
        self,
        message: str,
        *args,
    ) -> AsyncGenerator:
        inputs, _, _ = special_args(self.fn, inputs=[message, [], *args], request=None)

        if self.is_async:
            generator = self.fn(*inputs)
        else:
            generator = await anyio.to_thread.run_sync(
                self.fn, *inputs, limiter=self.limiter
            )
            generator = utils.SyncToAsyncIterator(generator, self.limiter)
        async for response in generator:
            yield self._process_example(message, response)

    def _pop_last_user_message(
        self,
        history: list[MessageDict] | TupleFormat,
    ) -> tuple[list[MessageDict] | TupleFormat, str | MultimodalPostprocess]:
        """
        Removes the message (or set of messages) that the user last sent from the chat history and returns them.
        If self.multimodal is True, returns a MultimodalPostprocess (dict) object with text and files.
        If self.multimodal is False, returns just the message text as a string.
        """
        if not history:
            return history, "" if not self.multimodal else {"text": "", "files": []}

        if self.type == "tuples":
            history = self._tuples_to_messages(history)  # type: ignore
        i = len(history) - 1
        while i >= 0 and history[i]["role"] == "assistant":  # type: ignore
            i -= 1
        while i >= 0 and history[i]["role"] == "user":  # type: ignore
            i -= 1
        last_messages = history[i + 1 :]
        last_user_message = ""
        files = []
        for msg in last_messages:
            assert isinstance(msg, dict)  # noqa: S101
            if msg["role"] == "user":
                content = msg["content"]
                if isinstance(content, tuple):
                    files.append(content[0])
                else:
                    last_user_message = content
        return_message = (
            {"text": last_user_message, "files": files}
            if self.multimodal
            else last_user_message
        )
        history_ = history[: i + 1]
        if self.type == "tuples":
            history_ = self._messages_to_tuples(history_)  # type: ignore
        return history_, return_message  # type: ignore

    def render(self) -> ChatInterface:
        # If this is being rendered inside another Blocks, and the height is not explicitly set, set it to 400 instead of 200.
        if get_blocks_context() and not self.provided_chatbot:
            self.chatbot.height = 400
            super().render()
        return self
