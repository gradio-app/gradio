import gradio as gr
from gradio.chat_interface import ChatInterface


def test_load_chat_textbox_override():
    custom_textbox = gr.Textbox(placeholder="Custom textbox", container=False)
    chat = gr.load_chat(
        base_url="http://localhost:1234/v1/",
        model="demo",
        token="dummy",
        textbox=custom_textbox,
        streaming=False,
    )
    assert isinstance(chat, ChatInterface)
    assert chat.textbox is custom_textbox


if __name__ == "__main__":
    test_load_chat_textbox_override()
    print("Test passed: load_chat allows textbox override.")
