import gradio as gr

def greet(name):
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name", value="World")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    name.change(fn=greet, inputs=name, outputs=output, api_name="greet")
    demo.load(lambda x: print(x), inputs=name)

if __name__ == "__main__":
    demo.launch()
