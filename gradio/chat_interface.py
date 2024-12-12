"""
This file defines a useful high-level abstraction to build Gradio chatbots: ChatInterface.
"""

from __future__ import annotations

import builtins
import functools
import inspect
import warnings
from collections.abc import AsyncGenerator, Callable, Generator, Sequence
from pathlib import Path
from typing import Literal, Union, cast

import anyio
from gradio_client.documentation import document

from gradio import utils
from gradio.blocks import Blocks
from gradio.components import (
    Button,
    Chatbot,
    Component,
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
from gradio.events import Dependency, SelectData
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
        examples: list[str] | list[MultimodalValue] | list[list] | None = None,
        example_labels: list[str] | None = None,
        example_icons: list[str] | None = None,
        run_examples_on_click: bool = True,
        cache_examples: bool | None = None,
        cache_mode: Literal["eager", "lazy"] | None = None,
        title: str | None = None,
        description: str | None = None,
        theme: Theme | str | None = None,
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
    ):
        """
        Parameters:
            fn: the function to wrap the chat interface around. In the default case (assuming `type` is set to "messages"), the function should accept two parameters: a `str` input message and `list` of openai-style dictionary {"role": "user" | "assistant", "content": `str` | {"path": `str`} | `gr.Component`} representing the chat history, and return/yield a `str` (if a simple message) or `dict` (for a complete openai-style message) response.
            multimodal: if True, the chat interface will use a `gr.MultimodalTextbox` component for the input, which allows for the uploading of multimedia files. If False, the chat interface will use a gr.Textbox component for the input. If this is True, the first argument of `fn` should accept not a `str` message but a `dict` message with keys "text" and "files"
            type: The format of the messages passed into the chat history parameter of `fn`. If "messages", passes the history as a list of dictionaries with openai-style "role" and "content" keys. The "content" key's value should be one of the following - (1) strings in valid Markdown (2) a dictionary with a "path" key and value corresponding to the file to display or (3) an instance of a Gradio component: at the moment gr.Image, gr.Plot, gr.Video, gr.Gallery, gr.Audio, and gr.HTML are supported. The "role" key should be one of 'user' or 'assistant'. Any other roles will not be displayed in the output. If this parameter is 'tuples' (deprecated), passes the chat history as a `list[list[str | None | tuple]]`, i.e. a list of lists. The inner list should have 2 elements: the user message and the response message.
            chatbot: an instance of the gr.Chatbot component to use for the chat interface, if you would like to customize the chatbot properties. If not provided, a default gr.Chatbot component will be created.
            textbox: an instance of the gr.Textbox or gr.MultimodalTextbox component to use for the chat interface, if you would like to customize the textbox properties. If not provided, a default gr.Textbox or gr.MultimodalTextbox component will be created.
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
            examples, example_labels, example_icons, multimodal
        )
        self.run_examples_on_click = run_examples_on_click
        self.cache_examples = cache_examples
        self.cache_mode = cache_mode
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

        with self:
            with Column():
                if title:
                    Markdown(
                        f"<h1 style='text-align: center; margin-bottom: 1rem'>{self.title}</h1>"
                    )
                if description:
                    Markdown(description)
                if chatbot:
                    if self.type:
                        if self.type != chatbot.type:
                            warnings.warn(
                                "The type of the gr.Chatbot does not match the type of the gr.ChatInterface."
                                f"The type of the gr.ChatInterface, '{self.type}', will be used."
                            )
                            chatbot.type = self.type
                            chatbot._setup_data_model()
                    else:
                        warnings.warn(
                            f"The gr.ChatInterface was not provided with a type, so the type of the gr.Chatbot, '{chatbot.type}', will be used."
                        )
                        self.type = chatbot.type
                    self.chatbot = cast(
                        Chatbot, get_component_instance(chatbot, render=True)
                    )
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
                        height=200 if fill_height else None,
                        type=self.type,
                        autoscroll=autoscroll,
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
                                autofocus=autofocus,
                                submit_btn=submit_btn,
                                stop_btn=stop_btn,
                            )

                        # Hide the stop button at the beginning, and show it with the given value during the generator execution.
                        self.original_stop_btn = self.textbox.stop_btn
                        self.textbox.stop_btn = False

                    self.fake_api_btn = Button("Fake API", visible=False)
                    self.fake_response_textbox = Textbox(
                        label="Response", visible=False
                    )

                if self.examples:
                    self.examples_handler = Examples(
                        examples=self.examples,
                        inputs=[self.textbox] + self.additional_inputs,
                        outputs=self.chatbot,
                        fn=self._examples_stream_fn
                        if self.is_generator
                        else self._examples_fn,
                        cache_examples=self.cache_examples,
                        cache_mode=self.cache_mode,
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

                self.saved_input = State()  # Stores the most recent user message
                self.previous_input = State(value=[])  # Stores all user messages
                self.chatbot_state = (
                    State(self.chatbot.value) if self.chatbot.value else State([])
                )
                self.show_progress = show_progress
                self._setup_events()
                self._setup_api()

    @staticmethod
    def _setup_example_messages(
        examples: list[str] | list[MultimodalValue] | list[list] | None,
        example_labels: list[str] | None = None,
        example_icons: list[str] | None = None,
        multimodal: bool = False,
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
                if multimodal:
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

    def _setup_events(self) -> None:
        submit_triggers = [self.textbox.submit, self.chatbot.retry]
        submit_fn = self._stream_fn if self.is_generator else self._submit_fn
        if hasattr(self.fn, "zerogpu"):
            submit_fn.__func__.zerogpu = self.fn.zerogpu  # type: ignore

        submit_event = (
            self.textbox.submit(
                self._clear_and_save_textbox,
                [self.textbox, self.previous_input],
                [self.textbox, self.saved_input, self.previous_input],
                show_api=False,
                queue=False,
            )
            .then(
                self._append_message_to_history,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                show_api=False,
                queue=False,
            )
            .then(
                submit_fn,
                [self.saved_input, self.chatbot] + self.additional_inputs,
                [self.chatbot] + self.additional_outputs,
                show_api=False,
                concurrency_limit=cast(
                    Union[int, Literal["default"], None], self.concurrency_limit
                ),
                show_progress=cast(
                    Literal["full", "minimal", "hidden"], self.show_progress
                ),
            )
        )
        submit_event.then(
            lambda: update(value=None, interactive=True),
            None,
            self.textbox,
            show_api=False,
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
                    example_select_event.then(
                        submit_fn,
                        [self.saved_input, self.chatbot],
                        [self.chatbot] + self.additional_outputs,
                        show_api=False,
                        concurrency_limit=cast(
                            Union[int, Literal["default"], None], self.concurrency_limit
                        ),
                        show_progress=cast(
                            Literal["full", "minimal", "hidden"], self.show_progress
                        ),
                    )
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
                [self.chatbot],
                [self.chatbot, self.saved_input],
                show_api=False,
                queue=False,
            )
            .then(
                lambda: update(interactive=False, placeholder=""),
                outputs=[self.textbox],
                show_api=False,
            )
            .then(
                self._append_message_to_history,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                show_api=False,
                queue=False,
            )
            .then(
                submit_fn,
                [self.saved_input, self.chatbot] + self.additional_inputs,
                [self.chatbot] + self.additional_outputs,
                show_api=False,
                concurrency_limit=cast(
                    Union[int, Literal["default"], None], self.concurrency_limit
                ),
                show_progress=cast(
                    Literal["full", "minimal", "hidden"], self.show_progress
                ),
            )
        )
        retry_event.then(
            lambda: update(interactive=True),
            outputs=[self.textbox],
            show_api=False,
        )

        self._setup_stop_events(submit_triggers, [submit_event, retry_event])

        self.chatbot.undo(
            self._pop_last_user_message,
            [self.chatbot],
            [self.chatbot, self.saved_input],
            show_api=False,
            queue=False,
        ).then(
            lambda x: x,
            self.saved_input,
            self.textbox,
            show_api=False,
            queue=False,
        )

        self.chatbot.option_select(
            self.option_clicked,
            [self.chatbot],
            [self.chatbot, self.saved_input],
            show_api=False,
        ).then(
            submit_fn,
            [self.saved_input, self.chatbot],
            [self.chatbot] + self.additional_outputs,
            show_api=False,
            concurrency_limit=cast(
                Union[int, Literal["default"], None], self.concurrency_limit
            ),
            show_progress=cast(
                Literal["full", "minimal", "hidden"], self.show_progress
            ),
        )

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

    def _setup_api(self) -> None:
        if self.is_generator:

            @functools.wraps(self.fn)
            async def api_fn(message, history, *args, **kwargs):  # type: ignore
                if self.is_async:
                    generator = self.fn(message, history, *args, **kwargs)
                else:
                    generator = await anyio.to_thread.run_sync(
                        self.fn, message, history, *args, **kwargs, limiter=self.limiter
                    )
                    generator = utils.SyncToAsyncIterator(generator, self.limiter)
                try:
                    first_response = await utils.async_iteration(generator)
                    yield first_response, history + [[message, first_response]]
                except StopIteration:
                    yield None, history + [[message, None]]
                async for response in generator:
                    yield response, history + [[message, response]]
        else:

            @functools.wraps(self.fn)
            async def api_fn(message, history, *args, **kwargs):
                if self.is_async:
                    response = await self.fn(message, history, *args, **kwargs)
                else:
                    response = await anyio.to_thread.run_sync(
                        self.fn, message, history, *args, **kwargs, limiter=self.limiter
                    )
                history.append([message, response])
                return response, history

        self.fake_api_btn.click(
            api_fn,
            [self.textbox, self.chatbot_state] + self.additional_inputs,
            [self.fake_response_textbox, self.chatbot_state],
            api_name=cast(Union[str, Literal[False]], self.api_name),
            concurrency_limit=cast(
                Union[int, Literal["default"], None], self.concurrency_limit
            ),
        )

    def _clear_and_save_textbox(
        self,
        message: str | MultimodalPostprocess,
        previous_input: list[str | MultimodalPostprocess],
    ) -> tuple[
        Textbox | MultimodalTextbox,
        str | MultimodalPostprocess,
        list[str | MultimodalPostprocess],
    ]:
        previous_input += [message]
        return (
            type(self.textbox)("", interactive=False, placeholder=""),
            message,
            previous_input,
        )

    def _append_message_to_history(
        self,
        message: MultimodalPostprocess | str,
        history: list[MessageDict] | TupleFormat,
    ):
        if isinstance(message, str):
            message = {"text": message}
        if self.type == "tuples":
            for x in message.get("files", []):
                if isinstance(x, dict):
                    x = x.get("path")
                history.append([(x,), None])  # type: ignore
            if message["text"] is None or not isinstance(message["text"], str):
                pass
            elif message["text"] == "" and message.get("files", []) != []:
                history.append([None, None])  # type: ignore
            else:
                history.append([message["text"], None])  # type: ignore
        else:
            for x in message.get("files", []):
                if isinstance(x, dict):
                    x = x.get("path")
                history.append({"role": "user", "content": (x,)})  # type: ignore
            if message["text"] is None or not isinstance(message["text"], str):
                pass
            else:
                history.append({"role": "user", "content": message["text"]})  # type: ignore
        return history

    def response_as_dict(self, response: MessageDict | Message | str) -> MessageDict:
        if isinstance(response, Message):
            new_response = response.model_dump()
        elif isinstance(response, str):
            return {"role": "assistant", "content": response}
        else:
            new_response = response
        return cast(MessageDict, new_response)

    def _process_msg_and_trim_history(
        self,
        message: str | MultimodalPostprocess,
        history_with_input: TupleFormat | list[MessageDict],
    ) -> tuple[str | MultimodalPostprocess, TupleFormat | list[MessageDict]]:
        if isinstance(message, dict):
            remove_input = len(message.get("files", [])) + int(
                message["text"] is not None
            )
            history = history_with_input[:-remove_input]
        else:
            history = history_with_input[:-1]
        return message, history  # type: ignore

    def _append_history(self, history, message, first_response=True):
        if self.type == "tuples":
            if history:
                history[-1][1] = message  # type: ignore
            else:
                history.append([message, None])
        else:
            message = self.response_as_dict(message)
            if first_response:
                history.append(message)  # type: ignore
            else:
                history[-1] = message

    async def _submit_fn(
        self,
        message: str | MultimodalPostprocess,
        history_with_input: TupleFormat | list[MessageDict],
        request: Request,
        *args,
    ) -> TupleFormat | list[MessageDict] | tuple[TupleFormat | list[MessageDict], ...]:
        message_serialized, history = self._process_msg_and_trim_history(
            message, history_with_input
        )
        inputs, _, _ = special_args(
            self.fn, inputs=[message_serialized, history, *args], request=request
        )

        if self.is_async:
            response = await self.fn(*inputs)
        else:
            response = await anyio.to_thread.run_sync(
                self.fn, *inputs, limiter=self.limiter
            )
        additional_outputs = None
        if isinstance(response, tuple):
            response, *additional_outputs = response

        self._append_history(history_with_input, response)

        if additional_outputs:
            return history_with_input, *additional_outputs
        return history_with_input

    async def _stream_fn(
        self,
        message: str | MultimodalPostprocess,
        history_with_input: TupleFormat | list[MessageDict],
        request: Request,
        *args,
    ) -> AsyncGenerator[
        TupleFormat | list[MessageDict] | tuple[TupleFormat | list[MessageDict], ...],
        None,
    ]:
        message_serialized, history = self._process_msg_and_trim_history(
            message, history_with_input
        )
        inputs, _, _ = special_args(
            self.fn, inputs=[message_serialized, history, *args], request=request
        )

        if self.is_async:
            generator = self.fn(*inputs)
        else:
            generator = await anyio.to_thread.run_sync(
                self.fn, *inputs, limiter=self.limiter
            )
            generator = utils.SyncToAsyncIterator(generator, self.limiter)

        additional_outputs = None
        try:
            first_response = await utils.async_iteration(generator)
            if isinstance(first_response, tuple):
                first_response, *additional_outputs = first_response
            self._append_history(history_with_input, first_response)
            yield (
                history_with_input
                if not additional_outputs
                else (history_with_input, *additional_outputs)
            )
        except StopIteration:
            yield history_with_input
        async for response in generator:
            if isinstance(response, tuple):
                response, *additional_outputs = response
            self._append_history(history_with_input, response, first_response=False)
            yield (
                history_with_input
                if not additional_outputs
                else (history_with_input, *additional_outputs)
            )

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
        history = []
        self._append_message_to_history(example.value, history)
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

    async def _pop_last_user_message(
        self,
        history: list[MessageDict] | TupleFormat,
    ) -> tuple[list[MessageDict] | TupleFormat, str | MultimodalPostprocess]:
        """
        Removes the last user message from the chat history and returns it.
        If self.multimodal is True, returns a MultimodalPostprocess (dict) object with text and files.
        If self.multimodal is False, returns just the message text as a string.
        """
        if not history:
            return history, "" if not self.multimodal else {"text": "", "files": []}

        if self.type == "messages":
            # Skip the last message as it's always an assistant message
            i = len(history) - 2
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
            return history[: i + 1], return_message  # type: ignore
        else:
            # Skip the last message pair as it always includes an assistant message
            i = len(history) - 2
            while i >= 0 and history[i][1] is None:  # type: ignore
                i -= 1
            last_messages = history[i + 1 :]
            last_user_message = ""
            files = []
            for msg in last_messages:
                assert isinstance(msg, (tuple, list))  # noqa: S101
                if isinstance(msg[0], tuple):
                    files.append(msg[0][0])
                elif msg[0] is not None:
                    last_user_message = msg[0]
            return_message = (
                {"text": last_user_message, "files": files}
                if self.multimodal
                else last_user_message
            )
            return history[: i + 1], return_message  # type: ignore

    def render(self) -> ChatInterface:
        # If this is being rendered inside another Blocks, and the height is not explicitly set, set it to 400 instead of 200.
        if get_blocks_context() and not self.provided_chatbot:
            self.chatbot.height = 400
            super().render()
        return self
