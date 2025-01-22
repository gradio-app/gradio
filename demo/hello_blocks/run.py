import gradio as gr


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")
with demo.route("Incrementer"):
    num = gr.Number()
    btn = gr.Button("Increment")
    btn.click(fn=lambda x: x + 1, inputs=num, outputs=num, api_name="increment")

if __name__ == "__main__":
    demo.launch()
