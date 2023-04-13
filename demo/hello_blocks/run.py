import gradio as gr

def greet2(name, name2):
    return "Hello " + name + " " + name2 +"!", "Hello " + name2 + " " + name +"!"

def greet(name):
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    name2 = gr.Textbox(label="second name")
    output = gr.Textbox(label="Output Box")
    output2 = gr.Textbox(label="Output Box 2")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet2, inputs=[name, name2], outputs=[output, output2], api_name="greet")
    hello_btn = gr.Button("Hello")
    hello_btn.click(fn=greet, inputs=name, outputs=output, api_name="hello")
    hey_btn = gr.Button("Hey")
    hey_btn.click(fn=greet, inputs=name, outputs=output)
   

if __name__ == "__main__":
    demo.launch()