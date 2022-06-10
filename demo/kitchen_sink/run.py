import gradio as gr

with gr.Blocks() as demo:
    i = gr.File()
    o = gr.File()
    i.change(lambda x:x.name, i, o)
  
demo.launch()