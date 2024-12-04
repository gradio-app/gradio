from datetime import datetime

import gradio as gr

def update_log():
    return datetime.now().timestamp()

with gr.Blocks() as demo:
    gr.Textbox(value=update_log, every=0.2, label="Time")
    
    slider = gr.Slider(1, 10, step=1)
    @gr.render(inputs=[slider])
    def show_log(s):
        for i in range(s):
            gr.Textbox(value=update_log, every=0.2, label=f"Render {i + 1}")

if __name__ == '__main__':
    demo.launch()
