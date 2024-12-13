import gradio as gr

def echo_multimodal(message, history):
    response = []
    response.append("You wrote: '" + message["text"] + "' and uploaded:")
    for file in message.get("files", []):
        response.append((file, ))
    return response

demo = gr.ChatInterface(
    echo_multimodal,
    type="messages",
    multimodal=True,
)

if __name__ == "__main__":
    demo.launch()
