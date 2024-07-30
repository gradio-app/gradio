import gradio as gr

with gr.Blocks() as demo:
    textbox = gr.Textbox(value="This is some text")
    gr.ClearButton(textbox)

if __name__ == "__main__":
    demo.launch()
