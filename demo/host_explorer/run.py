import gradio as gr

with gr.Blocks() as demo:
    file = gr.HostFile("/etc")
    submit_btn = gr.Button("Select")
    selected = gr.Textbox(label="Selected File")

    submit_btn.click(lambda x:x, file, selected)

if __name__ == "__main__":
    demo.launch()
