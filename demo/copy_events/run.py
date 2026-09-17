import gradio as gr
from gradio.components.chatbot import Message, MessageDict

md = "This is **bold** text."

chatbot_value: list[MessageDict | Message] = [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "World"},
    {"role": "user", "content": "Goodbye"},
    {"role": "assistant", "content": "World"},
]


def copy_callback(copy_data: gr.CopyData):
    return copy_data.value


with gr.Blocks() as demo:
    textbox = gr.Textbox(label="Copied text")
    with gr.Row():
        markdown = gr.Markdown(
            value=md, header_links=True, height=400, buttons=["copy"]
        )
        chatbot = gr.Chatbot(chatbot_value, buttons=["copy"])
        textbox2 = gr.Textbox(
            "Write something here", interactive=True, buttons=["copy"]
        )

        gr.on(
            [markdown.copy, chatbot.copy, textbox2.copy], copy_callback, outputs=textbox
        )

if __name__ == "__main__":
    demo.launch()
