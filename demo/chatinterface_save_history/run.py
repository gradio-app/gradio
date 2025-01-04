import gradio as gr

def echo_multimodal(message, history):
    response = "You wrote: '" + message["text"] + "' and uploaded: " + str(len(message["files"])) + " files"
    return response

demo = gr.ChatInterface(
    echo_multimodal,
    type="messages",
    multimodal=True,
    textbox=gr.MultimodalTextbox(file_count="multiple"),
    save_history=True,
)

if __name__ == "__main__":
    demo.launch()
