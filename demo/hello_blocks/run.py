import gradio as gr

def greet(name):
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    name = gr.MultimodalTextbox(label="Name")
    output = gr.MultimodalTextbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")
   

if __name__ == "__main__":
    demo.launch()