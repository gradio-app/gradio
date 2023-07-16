import gradio as gr

def greet(name):
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    with gr.Group():
        with gr.Row():
            with gr.Column():
                name = gr.Textbox(label="Name")
                btn = gr.Button("Hello")
                gr.Dropdown(["a", "b", "c"], interactive=True, container=False)
                gr.Number(container=False)
                gr.Textbox(container=False)
            with gr.Column():
                gr.Image()
                gr.Dropdown(["a", "b", "c"], interactive=True)
                with gr.Row():
                    gr.Number(scale=2)
                    gr.Textbox()
    with gr.Group():
        name = gr.Textbox(label="Name")
        output = gr.Textbox(show_label=False, container=False)
        greet_btn = gr.Button("Greet")
        with gr.Row():
            gr.Dropdown(["a", "b", "c"], interactive=True, container=False)
            gr.Textbox(container=False)
            gr.Number(container=False)
            gr.Image()
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

    with gr.Group():
        gr.Chatbot()
        with gr.Row():
            name = gr.Textbox(label="Prompot", container=False)
            go = gr.Button("go", scale=0)

    gr.Markdown("No Group, No Container")
    with gr.Column():
        gr.Radio([1,2,3], container=False)
        gr.Slider(0, 20, container=False)
    with gr.Row():
        with gr.Column():
            gr.Dropdown(["a", "b", "c"], interactive=True, container=False, elem_id="here2")
        with gr.Column():
           gr.Number(container=False)
        with gr.Column():
            gr.Textbox(container=False)

    gr.Markdown("No Group, has container") # breaking into columns to prevent Forms
    with gr.Row():
        with gr.Column():
            gr.Dropdown(["a", "b", "c"], interactive=True)
        with gr.Column():
            gr.Number()
        with gr.Column():
            gr.Textbox()

   

if __name__ == "__main__":
    demo.launch()