import gradio as gr

def greet(name):
    import time
    for letter in name:
        time.sleep(1)
        yield "Hello " + letter + "!"
    time.sleep(30)
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

if __name__ == "__main__":
    demo.launch()