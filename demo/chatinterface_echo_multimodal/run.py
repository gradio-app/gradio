import gradio as gr

def echo_multimodal(message, history):
    response = []
    response.append("You wrote: '" + message["text"] + "' and uploaded:")
    if message.get("files"):
        for file in message["files"]:
            response.append(gr.File(value=file))
    return response

demo = gr.ChatInterface(
    echo_multimodal,
    multimodal=True,
    textbox=gr.MultimodalTextbox(file_count="multiple"),
    api_name="chat",
)

if __name__ == "__main__":
    demo.launch()
