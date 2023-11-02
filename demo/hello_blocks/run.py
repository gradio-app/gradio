# import gradio as gr


# def greet(name):
#     return "Hello " + name + "!"


# with gr.Blocks() as demo:
#     name = gr.Textbox(label="Name")
#     output = gr.Textbox(label="Output Box")
#     greet_btn = gr.Button("Greet")
#     greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

# if __name__ == "__main__":
#     demo.launch()


import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            Drug = gr.Radio(["Yes", "No"])
            Family = gr.Radio(["Yes", "No"])

if __name__ == "__main__":
    demo.queue()
    demo.launch()
