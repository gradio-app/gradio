"""
This file defines a useful high-level abstraction to build Gradio chatbots: ChatInterface.
"""

from __future__ import annotations

import builtins
import functools
import inspect
import warnings
from collections.abc import AsyncGenerator, Callable, Sequence
from pathlib import Path
from typing import Literal, Union, cast

import anyio
from gradio_client.documentation import document

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
    FileDataDict,
    Message,
    MessageDict,
    TupleFormat,
)
from gradio.components.multimodal_textbox import MultimodalPostprocess, MultimodalValue
from gradio.context import get_blocks_context
from gradio.events import Dependency, SelectData
from gradio.helpers import create_examples as Examples  # noqa: N812
from gradio.helpers import special_args, update
from gradio.layouts import Accordion, Group, Row
from gradio.routes import Request
from gradio.themes import ThemeClass as Theme
from gradio.utils import SyncToAsyncIterator, async_iteration, async_lambda


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
    Demos: chatinterface_multimodal, chatinterface_random_response, chatinterface_streaming_echo
    Guides: creating-a-chatbot-fast, sharing-your-app
    """

    def __init__(
        self,
        fn: Callable,
        *,
        multimodal: bool = False,
        type: Literal["messages", "tuples"] = "tuples",
        chatbot: Chatbot | None = None,
        textbox: Textbox | MultimodalTextbox | None = None,
        additional_inputs: str | Component | list[str | Component] | None = None,
        additional_inputs_accordion: str | Accordion | None = None,
        examples: list[str] | list[MultimodalValue] | list[list] | None = None,
        example_labels: list[str] | None = None,
        example_icons: list[str] | None = None,
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
        concurrency_limit: int | None | Literal["default"] = "default",
        fill_height: bool = True,
        delete_cache: tuple[int, int] | None = None,
        show_progress: Literal["full", "minimal", "hidden"] = "minimal",
        fill_width: bool = False,
        submit_btn: str | bool | None = True,
        stop_btn: str | bool | None = True,
    ):
        """
        Parameters:
            fn: the function to wrap the chat interface around. Should accept two parameters: a string input message and list of two-element lists of the form [[user_message, bot_message], ...] representing the chat history, and return a string response. See the Chatbot documentation for more information on the chat history format.
            multimodal: if True, the chat interface will use a gr.MultimodalTextbox component for the input, which allows for the uploading of multimedia files. If False, the chat interface will use a gr.Textbox component for the input.
            type: The format of the messages passed into the chat history parameter of `fn`. If "messages", passes the value as a list of dictionaries with openai-style "role" and "content" keys. The "content" key's value should be one of the following - (1) strings in valid Markdown (2) a dictionary with a "path" key and value corresponding to the file to display or (3) an instance of a Gradio component. At the moment Image, Plot, Video, Gallery, Audio, and HTML are supported. The "role" key should be one of 'user' or 'assistant'. Any other roles will not be displayed in the output. If this parameter is 'tuples', expects a `list[list[str | None | tuple]]`, i.e. a list of lists. The inner list should have 2 elements: the user message and the response message, but this format is deprecated.
            chatbot: an instance of the gr.Chatbot component to use for the chat interface, if you would like to customize the chatbot properties. If not provided, a default gr.Chatbot component will be created.
            textbox: an instance of the gr.Textbox or gr.MultimodalTextbox component to use for the chat interface, if you would like to customize the textbox properties. If not provided, a default gr.Textbox or gr.MultimodalTextbox component will be created.
            additional_inputs: an instance or list of instances of gradio components (or their string shortcuts) to use as additional inputs to the chatbot. If components are not already rendered in a surrounding Blocks, then the components will be displayed under the chatbot, in an accordion.
            additional_inputs_accordion: if a string is provided, this is the label of the `gr.Accordion` to use to contain additional inputs. A `gr.Accordion` object can be provided as well to configure other properties of the container holding the additional inputs. Defaults to a `gr.Accordion(label="Additional Inputs", open=False)`. This parameter is only used if `additional_inputs` is provided.
            examples: sample inputs for the function; if provided, appear within the chatbot and can be clicked to populate the chatbot input. Should be a list of strings if `multimodal` is False, and a list of dictionaries (with keys `text` and `files`) if `multimodal` is True. Should also include values for the additional inputs if they are provided.
            example_labels: labels for the examples, to be displayed instead of the examples themselves. If provided, should be a list of strings with the same length as the examples list.
            example_icons: icons for the examples, to be displayed above the examples. If provided, should be a list of string URLs or local paths with the same length as the examples list.
            cache_examples: if True, caches examples in the server for fast runtime in examples. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
            cache_mode: If "lazy", then examples are cached (for all users of the app) after their first use (by any user of the app). If "eager", all examples are cached at app launch. If None, will use the GRADIO_CACHE_MODE environment variable if defined, or default to "eager".
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
            autoscroll: If True, will automatically scroll to the bottom of the textbox when the value changes, unless the user scrolls up. If False, will not scroll to the bottom of the textbox when the value changes.
            concurrency_limit: if set, this is the maximum number of chatbot submissions that can be running simultaneously. Can be set to None to mean no limit (any number of chatbot submissions can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `.queue()`, which is 1 by default).
            fill_height: if True, the chat interface will expand to the height of window.
            delete_cache: a tuple corresponding [frequency, age] both expressed in number of seconds. Every `frequency` seconds, the temporary files created by this Blocks instance will be deleted if more than `age` seconds have passed since the file was created. For example, setting this to (86400, 86400) will delete temporary files every day. The cache will be deleted entirely when the server restarts. If None, no cache deletion will occur.
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            fill_width: Whether to horizontally expand to fill container fully. If False, centers and constrains app to a maximum width.
            submit_btn: If True, will show a submit button with a submit icon within the textbox. If a string, will use that string as the submit button text in place of the icon. If False, will not show a submit button.
            stop_btn: If True, will show a button with a stop icon during generator executions, to stop generating. If a string, will use that string as the submit button text in place of the stop icon. If False, will not show a stop button.
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
        self.type: Literal["messages", "tuples"] = type
        self.multimodal = multimodal
        self.concurrency_limit = concurrency_limit
        self.fn = fn
        self.is_async = inspect.iscoroutinefunction(
            self.fn
        ) or inspect.isasyncgenfunction(self.fn)
        self.is_generator = inspect.isgeneratorfunction(
            self.fn
        ) or inspect.isasyncgenfunction(self.fn)

        self.examples = examples
        self.cache_examples = cache_examples
        self.cache_mode = cache_mode

        if additional_inputs:
            if not isinstance(additional_inputs, list):
                additional_inputs = [additional_inputs]
            self.additional_inputs = [
                get_component_instance(i)
                for i in additional_inputs  # type: ignore
            ]
        else:
            self.additional_inputs = []
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

        with self:
            if title:
                Markdown(
                    f"<h1 style='text-align: center; margin-bottom: 1rem'>{self.title}</h1>"
                )
            if description:
                Markdown(description)

            examples_messages: list[ExampleMessage] = []
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
                    if example_icons:
                        example_message["icon"] = example_icons[index]
                    examples_messages.append(example_message)

            self.provided_chatbot = chatbot is not None
            if chatbot:
                if self.type != chatbot.type:
                    warnings.warn(
                        "The type of the chatbot does not match the type of the chat interface. The type of the chat interface will be used."
                        "Recieved type of chatbot: {chatbot.type}, type of chat interface: {self.type}"
                    )
                    chatbot.type = self.type
                self.chatbot = cast(
                    Chatbot, get_component_instance(chatbot, render=True)
                )
                self.chatbot.examples = examples_messages
            else:
                self.chatbot = Chatbot(
                    label="Chatbot",
                    scale=1,
                    height=200 if fill_height else None,
                    type=self.type,
                    autoscroll=autoscroll,
                    examples=examples_messages if not self.additional_inputs else None,
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
                self.fake_response_textbox = Textbox(label="Response", visible=False)

            if examples:
                if self.is_generator:
                    examples_fn = self._examples_stream_fn
                else:
                    examples_fn = self._examples_fn
                if self.examples and self.additional_inputs:
                    self.examples_handler = Examples(
                        examples=examples,
                        inputs=[self.textbox] + self.additional_inputs,
                        outputs=self.chatbot,
                        fn=examples_fn,
                        cache_examples=self.cache_examples,
                        cache_mode=self.cache_mode,
                    )
                else:
                    self.examples_handler = Examples(
                        examples=examples,
                        inputs=[self.textbox] + self.additional_inputs,
                        outputs=self.chatbot,
                        fn=examples_fn,
                        cache_examples=self.cache_examples,
                        cache_mode=self.cache_mode,
                        visible=False,
                        preprocess=False,
                        postprocess=True,
                    )

            any_unrendered_inputs = any(
                not inp.is_rendered for inp in self.additional_inputs
            )
            if self.additional_inputs and any_unrendered_inputs:
                with Accordion(**self.additional_inputs_accordion_params):  # type: ignore
                    for input_component in self.additional_inputs:
                        if not input_component.is_rendered:
                            input_component.render()

            self.saved_input = State()
            self.chatbot_state = (
                State(self.chatbot.value) if self.chatbot.value else State([])
            )
            self.previous_input = State(value=[])
            self.show_progress = show_progress
            self._setup_events()
            self._setup_api()

    def _setup_events(self) -> None:
        submit_fn = self._stream_fn if self.is_generator else self._submit_fn
        submit_triggers = [self.textbox.submit, self.chatbot.retry]

        submit_event = (
            self.textbox.submit(
                self._clear_and_save_textbox,
                [self.textbox, self.previous_input],
                [self.textbox, self.saved_input, self.previous_input],
                show_api=False,
                queue=False,
            )
            .then(
                self._display_input,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                show_api=False,
                queue=False,
            )
            .then(
                submit_fn,
                [self.saved_input, self.chatbot] + self.additional_inputs,
                [self.chatbot],
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
            and not self.additional_inputs
        ):
            if self.cache_examples:
                self.chatbot.example_select(
                    self.example_clicked,
                    [self.chatbot],
                    [self.chatbot, self.saved_input],
                    show_api=False,
                )
            else:
                self.chatbot.example_select(
                    self.example_clicked,
                    [self.chatbot],
                    [self.chatbot, self.saved_input],
                    show_api=False,
                ).then(
                    submit_fn,
                    [self.saved_input, self.chatbot],
                    [self.chatbot],
                    show_api=False,
                    concurrency_limit=cast(
                        Union[int, Literal["default"], None], self.concurrency_limit
                    ),
                    show_progress=cast(
                        Literal["full", "minimal", "hidden"], self.show_progress
                    ),
                )

        retry_event = (
            self.chatbot.retry(
                self._delete_prev_fn,
                [self.saved_input, self.chatbot],
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
                self._display_input,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                show_api=False,
                queue=False,
            )
            .then(
                submit_fn,
                [self.saved_input, self.chatbot] + self.additional_inputs,
                [self.chatbot],
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
            self._undo_msg,
            [self.previous_input, self.chatbot],
            [self.chatbot, self.textbox, self.saved_input, self.previous_input],
            show_api=False,
            queue=False,
        )

    def _setup_stop_events(
        self, event_triggers: list[Callable], events_to_cancel: list[Dependency]
    ) -> None:
        textbox_component = MultimodalTextbox if self.multimodal else Textbox
        if self.is_generator:
            original_submit_btn = self.textbox.submit_btn
            for event_trigger in event_triggers:
                event_trigger(
                    async_lambda(
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
                    async_lambda(
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
                    generator = SyncToAsyncIterator(generator, self.limiter)
                try:
                    first_response = await async_iteration(generator)
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
            api_name="chat",
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
        if self.multimodal:
            previous_input += [message]
            return (
                MultimodalTextbox("", interactive=False, placeholder=""),
                message,
                previous_input,
            )
        else:
            previous_input += [message]
            return (
                Textbox("", interactive=False, placeholder=""),
                message,
                previous_input,
            )

    def _append_multimodal_history(
        self,
        message: MultimodalPostprocess,
        response: MessageDict | str | None,
        history: list[MessageDict] | TupleFormat,
    ):
        if self.type == "tuples":
            for x in message.get("files", []):
                if isinstance(x, dict):
                    history.append([(x.get("path"),), None])  # type: ignore
                else:
                    history.append([(x,), None])  # type: ignore
            if message["text"] is None or not isinstance(message["text"], str):
                return
            elif message["text"] == "" and message.get("files", []) != []:
                history.append([None, response])  # type: ignore
            else:
                history.append([message["text"], cast(str, response)])  # type: ignore
        else:
            for x in message.get("files", []):
                if isinstance(x, dict):
                    history.append(
                        {"role": "user", "content": cast(FileDataDict, x)}  # type: ignore
                    )
                else:
                    history.append({"role": "user", "content": (x,)})  # type: ignore
            if message["text"] is None or not isinstance(message["text"], str):
                return
            else:
                history.append({"role": "user", "content": message["text"]})  # type: ignore
            if response:
                history.append(cast(MessageDict, response))  # type: ignore

    async def _display_input(
        self,
        message: str | MultimodalPostprocess,
        history: TupleFormat | list[MessageDict],
    ) -> tuple[TupleFormat, TupleFormat] | tuple[list[MessageDict], list[MessageDict]]:
        if self.multimodal and isinstance(message, dict):
            self._append_multimodal_history(message, None, history)
        elif isinstance(message, str) and self.type == "tuples":
            history.append([message, None])  # type: ignore
        elif isinstance(message, str) and self.type == "messages":
            history.append({"role": "user", "content": message})  # type: ignore
        return history  # type: ignore

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
        return message, history

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
    ) -> tuple[TupleFormat, TupleFormat] | tuple[list[MessageDict], list[MessageDict]]:
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
        self._append_history(history_with_input, response)

        return history_with_input  # type: ignore

    async def _stream_fn(
        self,
        message: str | MultimodalPostprocess,
        history_with_input: TupleFormat | list[MessageDict],
        request: Request,
        *args,
    ) -> AsyncGenerator:
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
            generator = SyncToAsyncIterator(generator, self.limiter)
        try:
            first_response = await async_iteration(generator)
            self._append_history(history_with_input, first_response)
            yield history_with_input
        except StopIteration:
            yield history_with_input
        async for response in generator:
            self._append_history(history_with_input, response, first_response=False)
            yield history_with_input

    def example_clicked(self, x: SelectData, history):
        if self.cache_examples:
            return self.examples_handler.load_from_cache(x.index)[0].root
        if self.multimodal:
            message = MultimodalPostprocess(**cast(dict, x.value))
            self._append_multimodal_history(message, None, history)
        else:
            message = x.value["text"]
            if self.type == "tuples":
                history.append([message, None])
            else:
                history.append({"role": "user", "content": message})
        self.saved_input.value = message
        return history, message

    def _process_example(
        self, message: ExampleMessage | str, response: MessageDict | str | None
    ):
        result = []
        if self.multimodal:
            message = cast(ExampleMessage, message)
            if self.type == "tuples":
                if "text" in message:
                    result.append([message["text"], None])
                for file in message.get("files", []):
                    result.append([file, None])
                result[-1][1] = response
            else:
                if "text" in message:
                    result.append({"role": "user", "content": message["text"]})
                for file in message.get("files", []):
                    result.append({"role": "assistant", "content": file})
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
        return self._process_example(message, response)

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
            generator = SyncToAsyncIterator(generator, self.limiter)
        async for response in generator:
            yield self._process_example(message, response)

    async def _delete_prev_fn(
        self,
        message: str | MultimodalPostprocess | None,
        history: list[MessageDict] | TupleFormat,
    ) -> tuple[list[MessageDict] | TupleFormat, str | MultimodalPostprocess]:
        extra = 1 if self.type == "messages" else 0
        if self.multimodal and isinstance(message, dict):
            remove_input = (
                len(message.get("files", [])) + 1
                if message["text"] is not None
                else len(message.get("files", []))
            ) + extra
            history = history[:-remove_input]
        else:
            history = history[: -(1 + extra)]
        return history, message or ""  # type: ignore

    async def _undo_msg(
        self,
        previous_input: list[str | MultimodalPostprocess],
        history: list[MessageDict] | TupleFormat,
    ):
        msg = previous_input.pop() if previous_input else None

        history, msg = await self._delete_prev_fn(msg, history)
        previous_msg = previous_input[-1] if len(previous_input) else msg
        return history, msg, previous_msg, previous_input

    def render(self) -> ChatInterface:
        # If this is being rendered inside another Blocks, and the height is not explicitly set, set it to 400 instead of 200.
        if get_blocks_context() and not self.provided_chatbot:
            self.chatbot.height = 400
            super().render()
        return self
