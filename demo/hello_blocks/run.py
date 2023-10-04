import gradio as gr
from newnewtext import NewNewText


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    # name = gr.Textbox(label="Name")
    # output = gr.Textbox(label="Output Box")
    # greet_btn = gr.Button("Greet")
    # greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")
    NewNewText()

if __name__ == "__main__":
    demo.launch()
