import gradio as gr

def greet(name):
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")
    hello_btn = gr.Button("Hello")
    hello_btn.click(fn=greet, inputs=name, outputs=output, api_name="hello")
    hey_btn = gr.Button("Hey")
    hey_btn.click(fn=greet, inputs=name, outputs=output, api_name="hey")
   

if __name__ == "__main__":
    demo.launch()