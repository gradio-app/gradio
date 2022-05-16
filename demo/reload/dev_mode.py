"""
Simple Gradio example with development reload feature.

python demo/reload/dev_mode.py
"""
import gradio as gr
import gradio
import uvicorn


def greet(str):
    print(str)


with gr.Blocks() as demo:
    text = gr.Text()
    text.change(greet, text, text)

app = gradio.routes.App.create_app(demo)

if __name__ == "__main__":
    uvicorn.run(app="app:app", reload=True, debug=True, reload_dirs=["gradio"])
