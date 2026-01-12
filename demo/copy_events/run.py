import gradio as gr

md = "This is **bold** text."

def copy_callback(copy_data: gr.CopyData):
    return copy_data.value

with gr.Blocks() as demo:
    textbox = gr.Textbox(label="Copied text")
    with gr.Row():
        markdown = gr.Markdown(value=md, header_links=True, height=400, buttons=["copy"])
        chatbot = gr.Chatbot([("Hello", "World"), ("Goodbye", "World")], buttons=["copy"])  # type: ignore
        textbox2 = gr.Textbox("Write something here", interactive=True, buttons=["copy"])

        gr.on(
            [markdown.copy, chatbot.copy, textbox2.copy],
            copy_callback,
            outputs=textbox
        )

if __name__ == "__main__":
    demo.launch()
