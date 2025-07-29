import time
import gradio as gr

def slow_echo(message, history):
    for i in range(len(message["text"])):
        time.sleep(0.05)
        yield "You typed: " + message["text"][: i + 1]

chat = gr.ChatInterface(
    slow_echo,
    type="messages",
    flagging_mode="manual",
    flagging_options=["Like", "Spam", "Inappropriate", "Other"],
    save_history=False,
    multimodal=True,
)

with gr.Blocks() as demo:
    chat.render()
    gr.DeepLinkButton()


if __name__ == "__main__":
    demo.launch()
