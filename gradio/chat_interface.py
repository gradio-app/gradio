"""
This file defines a useful high-level abstraction to build Gradio chatbots: ChatInterface.
"""


from __future__ import annotations

from typing import Callable

from gradio_client.documentation import document, set_documentation_group

from gradio.blocks import Blocks
from gradio.components import (
    Button,
    Chatbot,
    Markdown,
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
        self.history = []

        with self:
            if title:
                Markdown(
                    f"<h1 style='text-align: center; margin-bottom: 1rem'>{self.title}</h1>"
                )
            if description:
                Markdown(description)

            with Group():
                self.chatbot = chatbot or Chatbot(label="Input")
                self.textbox = textbox or Textbox(
                    show_label=False, placeholder="Type a message..."
                )
            
            if examples:
                self.examples_handler = Examples(
                    examples=examples,
                    inputs=self.textbox,
                    outputs=self.chatbot,
                    fn=self.fn,
                    cache_examples=self.cache_examples,
                )

            # self.stored_history = State()
            # self.stored_input = State()

            # # Invisible elements only used to set up the API
            # api_btn = Button(visible=False)
            # api_output_textbox = Textbox(visible=False, label="output")

            # self.buttons = [submit_btn, retry_btn, clear_btn]

            # self.textbox.submit(
            #     self.clear_and_save_textbox,
            #     [self.textbox],
            #     [self.textbox, self.stored_input],
            #     api_name=False,
            #     queue=False,
            # ).then(
            #     self.submit_fn,
            #     [self.chatbot, self.stored_input],
            #     [self.chatbot],
            #     api_name=False,
            # )

            # submit_btn.click(self.submit_fn, [self.chatbot, self.textbox], [self.chatbot, self.textbox], api_name=False)
            # delete_btn.click(self.delete_prev_fn, [self.chatbot], [self.chatbot, self.stored_input], queue=False, api_name=False)
            # retry_btn.click(self.delete_prev_fn, [self.chatbot], [self.chatbot, self.stored_input], queue=False, api_name=False).success(self.retry_fn, [self.chatbot, self.stored_input], [self.chatbot], api_name=False)
            # api_btn.click(self.submit_fn, [self.stored_history, self.textbox], [self.stored_history, api_output_textbox], api_name="chat")
            # clear_btn.click(lambda :[], None, self.chatbot, api_name="clear")

    # def clear_and_save_textbox(self, inp):
    #     return "", inp

    # def disable_button(self):
    #     # Need to implement in the event handlers above
    #     return Button.update(interactive=False)

    # def enable_button(self):
    #     # Need to implement in the event handlers above
    #     return Button.update(interactive=True)

    # def submit_fn(self, history, inp):
    #     # Need to handle streaming case
    #     out = self.fn(history, inp)
    #     history.append((inp, out))
    #     return history

    # def delete_prev_fn(self, history):
    #     try:
    #         inp, _ = history.pop()
    #     except IndexError:
    #         inp = None
    #     return history, inp

    # def retry_fn(self, history, inp):
    #     if inp is not None:
    #         out = self.fn(history, inp)
    #         history.append((inp, out))
    #     return history
