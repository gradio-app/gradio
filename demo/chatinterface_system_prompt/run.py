import gradio as gr
import time

def echo(message, history, system_prompt, tokens):
    response = f"System prompt: {system_prompt}\n Message: {message}."
    for i in range(min(len(response), int(tokens))):
        time.sleep(0.05)
        yield response[: i + 1]

demo = gr.ChatInterface(
    echo,
    type="messages",
    additional_inputs=[
        gr.Textbox("You are helpful AI.", label="System Prompt"),
        gr.Slider(10, 100),
    ],
)

if __name__ == "__main__":
    demo.launch()
