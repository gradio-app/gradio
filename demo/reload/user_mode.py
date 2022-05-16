"""
Simple Gradio example with user reload feature.

python demo/reload/user_mode.py
"""
import gradio as gr
import gradio
import uvicorn


def greet(str):
    return str


with gr.Blocks() as demo:
    text = gr.Text()
    text_2 = gr.Text()
    text.change(greet, text, text_2)

app = gradio.routes.App.create_app(demo)

if __name__ == "__main__":
    uvicorn.run(app="user_mode:app", reload=True, debug=True)
