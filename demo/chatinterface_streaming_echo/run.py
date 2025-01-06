import time
import gradio as gr

def slow_echo(message, history):
    for i in range(len(message)):
        time.sleep(0.05)
        yield "You typed: " + message[: i + 1]

# demo = gr.ChatInterface(
#     slow_echo,
#     type="messages",
#     flagging_mode="manual",
#     flagging_options=["Like", "Spam", "Inappropriate", "Other"], 
#     save_history=True,
# )

import gradio as gr

with gr.Blocks() as demo:
    c = gr.Chatbot(
        value=[{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi"}, {"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Go away"}],
        type="messages",
        feedback_options=["Like", "Spam", "Inappropriate", "Other"],
        feedback_value=["Like", "Other"],
    )
    c.like(lambda x: x, None, None)

if __name__ == "__main__":
    demo.launch()
