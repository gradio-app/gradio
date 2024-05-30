import gradio as gr

gr.Interface(lambda x:x, "text", "text").launch()