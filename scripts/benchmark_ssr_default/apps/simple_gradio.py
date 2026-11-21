import gradio as gr


def greet(name):
    return f"Hello {name}!"


with gr.Blocks(title="bench") as demo:
    name = gr.Textbox(label="Name", elem_id="name")
    btn = gr.Button("Greet", elem_id="greet")
    out = gr.Textbox(label="Greeting", elem_id="out")
    btn.click(greet, name, out, api_name="greet")
