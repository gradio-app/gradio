"""
This file defines a useful high-level abstraction to build Gradio chatbots: ChatInterface.
"""


from __future__ import annotations

import inspect
from typing import Callable

from gradio_client.documentation import document, set_documentation_group

from gradio.blocks import Blocks
from gradio.components import (
    Button,
    Chatbot,
    Markdown,
    State,
    Textbox,
)
from gradio.helpers import create_examples as Examples  # noqa: N812
from gradio.layouts import Group, Row
from gradio.themes import ThemeClass as Theme

set_documentation_group("interface")


@document()
class ChatInterface(Blocks):
    def __init__(
        self,
        fn: Callable,
        *,
        chatbot: Chatbot | None = None,
        textbox: Textbox | None = None,
        examples: list[str] | None = None,
        cache_examples: bool | None = None,
        title: str | None = None,
        description: str | None = None,
        theme: Theme | str | None = None,
        css: str | None = None,
        analytics_enabled: bool | None = None,
        submit_btn: str | None | Button = "Submit",
        retry_btn: str | None | Button = "🔄  Retry",
        delete_last_btn: str | None | Button = None,
        clear_btn: str | None | Button = "🗑️  Clear History",
    ):
        """
        Parameters:
            fn: the function to wrap the chat interface around. Should accept two parameters: a string input message and list of two-element lists of the form [[user_message, bot_message], ...] representing the chat history, and return a string response. See the Chatbot documentation for more information on the chat history format.
            chatbot: an instance of the gr.Chatbot component to use for the chat interface. If not provided, a default gr.Chatbot component will be created.
            textbox: an instance of the gr.Textbox component to use for the chat interface. If not provided, a default gr.Textbox component will be created.
            examples: sample inputs for the function; if provided, appear below the chatbot and can be clicked to populate the chatbot input.
            cache_examples: If True, caches examples in the server for fast runtime in examples. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
            title: a title for the interface; if provided, appears above chatbot in large font. Also used as the tab title when opened in a browser window.
            description: a description for the interface; if provided, appears above the chatbot and beneath the title in regular font. Accepts Markdown and HTML content.
            theme: Theme to use, loaded from gradio.themes.
            css: custom css or path to custom css file to use with interface.
            analytics_enabled: Whether to allow basic telemetry. If None, will use GRADIO_ANALYTICS_ENABLED environment variable if defined, or default to True.
            submit_btn: Text to display on the submit button. If None, no button will be displayed. If a Button object, that button will be used.
            retry_btn: Text to display on the retry button. If None, no button will be displayed. If a Button object, that button will be used.
            delete_last_btn: Text to display on the delete last button. If None, no button will be displayed. If a Button object, that button will be used.
            clear_btn: Text to display on the clear button. If None, no button will be displayed. If a Button object, that button will be used.
        """
        super().__init__(
            analytics_enabled=analytics_enabled,
            mode="chat_interface",
            css=css,
            title=title or "Gradio",
            theme=theme,
        )
        self.fn = fn
        self.examples = examples
        self.cache_examples = cache_examples
        self.buttons: list[Button] = []
        self.history = []

        with self:
            if title:
                Markdown(
                    f"<h1 style='text-align: center; margin-bottom: 1rem'>{self.title}</h1>"
                )
            if description:
                Markdown(description)

            with Group():
                if chatbot:
                    self.chatbot = chatbot.render()
                else:
                    self.chatbot = Chatbot(label="Input")
                if textbox:
                    self.textbox = textbox.render() 
                else: 
                    self.textbox = Textbox(show_label=False, placeholder="Type a message...")
            
            with Row():
                if submit_btn:
                    if isinstance(submit_btn, Button):
                        submit_btn.render()
                    elif isinstance(submit_btn, str):
                        submit_btn = Button(submit_btn, variant="primary")
                    else:
                        raise ValueError(f"The submit_btn parameter must be a gr.Button, string, or None, not {type(submit_btn)}")
                    self.buttons.append(submit_btn)
                self.stop_btn = Button("Stop", variant="stop", visible=False)
                
                for btn in [retry_btn, delete_last_btn, clear_btn]:
                    if btn:
                        if isinstance(btn, Button):
                            btn.render()
                        elif isinstance(btn, str):
                            btn = Button(btn, variant="secondary")
                        else:
                            raise ValueError(f"All the _btn parameters must be a gr.Button, string, or None, not {type(btn)}")
                    self.buttons.append(btn)
                
                self.fake_api_btn = Button("Fake API", visible=False)
                self.submit_btn, self.retry_btn, self.delete_last_btn, self.clear_btn = self.buttons
            
            if examples:
                self.examples_handler = Examples(
                    examples=examples,
                    inputs=self.textbox,
                    outputs=self.chatbot,
                    fn=self.fn,
                    cache_examples=self.cache_examples,
                )
            
            self.saved_input = State()
            
            self._setup_events()
            self._setup_api()

    def _setup_events(self):
        if inspect.isgeneratorfunction(self.fn):
            submit_fn = self._stream_fn
        else:
            submit_fn = self._submit_fn

        self.textbox.submit(
            self._clear_and_save_textbox,
            [self.textbox],
            [self.textbox, self.saved_input],
            api_name=False,
            queue=False,
        ).then(
            self._display_input,
            [self.saved_input, self.chatbot],
            [self.chatbot],
            api_name=False,
            queue=False,
        ).then(
            submit_fn,
            [self.saved_input, self.chatbot],
            [self.chatbot],
            api_name=False,
        )

        if self.submit_btn:
            self.submit_btn.click(
                self._clear_and_save_textbox,
                [self.textbox],
                [self.textbox, self.saved_input],
                api_name=False,
                queue=False,
            ).then(
                self._display_input,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                api_name=False,
                queue=False,
            ).then(
                submit_fn,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                api_name=False,
            )
        
        if self.retry_btn:
            self.retry_btn.click(
                self._delete_prev_fn,
                [self.chatbot],
                [self.chatbot, self.saved_input],
                api_name=False,
                queue=False,
            ).then(
                self._display_input,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                api_name=False,
                queue=False,
            ).then(
                submit_fn,
                [self.saved_input, self.chatbot],
                [self.chatbot],
                api_name=False,
            )

        if self.delete_last_btn:
            self.delete_last_btn.click(
                self._delete_prev_fn,
                [self.chatbot],
                [self.chatbot, self.saved_input],
                api_name=False,
                queue=False,
            )

        if self.clear_btn:
            self.clear_btn.click(
                lambda :([], None), 
                None, 
                [self.chatbot, self.saved_input],
                queue=False,
                api_name=False)
            
    def _setup_api(self):
        if inspect.isgeneratorfunction(self.fn):
            api_fn = self._api_stream_fn
        else:
            api_fn = self._api_submit_fn

        # Use a gr.State() instead of self.chatbot so that the API doesn't require passing forth
        # a chat history, instead it is just stored internally in the state.
        history = State([])

        self.fake_api_btn.click(
            api_fn,
            [self.saved_input, history],
            [history],
            api_name="chat",
        )

    def _clear_and_save_textbox(self, message):
        return "", message

    def _display_input(self, message: str, history: list[list[str]]):
        history.append((message, None))
        return history

    def _submit_fn(self, message: str, history: list[list[str]]):
        response = self.fn(message, history)
        history[-1][1] = response
        return history

    def _stream_fn(self, message: str, history: list[list[str]]):
        for response in self.fn(message, history):
            history[-1][1] = response
            yield history

    def _api_submit_fn(self, message: str, history: list[list[str]]):
        history = self._display_input(message, history)
        history = self._submit_fn(message, history)
        return history
        
    def _api_stream_fn(self, message: str, history: list[list[str]]):
        history = self._display_input(message, history)
        for response in self._stream_fn(message, history):
            return response

    def _delete_prev_fn(self, history):
        try:
            message, _ = history.pop()
        except IndexError:
            message = None
        return history, message
