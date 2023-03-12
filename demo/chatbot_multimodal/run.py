import gradio as gr
from urllib.parse import quote

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(elem_id="chatbot").style(height=500)

    with gr.Row():
        with gr.Column(scale=0.85):
            txt = gr.Textbox(
                show_label=False,
                placeholder="Enter text and press enter, or upload an image",
            ).style(container=False)
        with gr.Column(scale=0.15, min_width=0):
            btn = gr.UploadButton("🖼️", file_types=["image"])

    def add_text(history, text):
        history = history + [(text, None)]
        return history, ""

    def add_image(history, image):
        history = history + [(f"![](/file={quote(image.name)})", None)]
        return history

    def bot_response(history):
        response = "Cool!"
        history[-1][1] = response
        return history

    txt.submit(add_text, [chatbot, txt], [chatbot, txt]).then(
        bot_response, chatbot, chatbot
    )
    btn.upload(add_image, [chatbot, btn], [chatbot]).then(
        bot_response, chatbot, chatbot
    )

if __name__ == "__main__":
    demo.launch()
