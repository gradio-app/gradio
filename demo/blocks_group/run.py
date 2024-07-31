import gradio as gr

def greet(name):
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    gr.Markdown("### This is a couple of elements without any gr.Group. Form elements naturally group together anyway.")
    gr.Textbox("A")
    gr.Number(3)
    gr.Button()
    gr.Image()
    gr.Slider()

    gr.Markdown("### This is the same set put in a gr.Group.")
    with gr.Group():
        gr.Textbox("A")
        gr.Number(3)
        gr.Button()
        gr.Image()
        gr.Slider()

    gr.Markdown("### Now in a Row, no group.")
    with gr.Row():
        gr.Textbox("A")
        gr.Number(3)
        gr.Button()
        gr.Image()
        gr.Slider()

    gr.Markdown("### Now in a Row in a group.")
    with gr.Group():
        with gr.Row():
            gr.Textbox("A")
            gr.Number(3)
            gr.Button()
            gr.Image()
            gr.Slider()

    gr.Markdown("### Several rows grouped together.")
    with gr.Group():
        with gr.Row():
            gr.Textbox("A")
            gr.Number(3)
            gr.Button()
        with gr.Row():
            gr.Image()
            gr.Audio()

    gr.Markdown("### Several columns grouped together. If columns are uneven, there is a gray group background.")
    with gr.Group():
        with gr.Row():
            with gr.Column():
                name = gr.Textbox(label="Name")
                btn = gr.Button("Hello")
                gr.Dropdown(["a", "b", "c"], interactive=True)
                gr.Number()
                gr.Textbox()
            with gr.Column():
                gr.Image()
                gr.Dropdown(["a", "b", "c"], interactive=True)
                with gr.Row():
                    gr.Number(scale=2)
                    gr.Textbox()

    gr.Markdown("### container=False removes label, padding, and block border, placing elements 'directly' on background.")
    gr.Radio([1,2,3], container=False)
    gr.Textbox(container=False)
    gr.Image("https://picsum.photos/id/237/200/300", container=False, height=200)

    gr.Markdown("### Textbox, Dropdown, and Number input boxes takes up full space when within a group without a container.")

    with gr.Group():
        name = gr.Textbox(label="Name")
        output = gr.Textbox(show_label=False, container=False)
        greet_btn = gr.Button("Greet")
        with gr.Row():
            gr.Dropdown(["a", "b", "c"], interactive=True, container=False)
            gr.Textbox(container=False)
            gr.Number(container=False)
            gr.Image(height=100)
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

    gr.Markdown("### More examples")

    with gr.Group():
        gr.Chatbot()
        with gr.Row():
            name = gr.Textbox(label="Prompot", container=False)
            go = gr.Button("go", scale=0)

    with gr.Column():
        gr.Radio([1,2,3], container=False)
        gr.Slider(0, 20, container=False)

    with gr.Group():
        with gr.Row():
            gr.Dropdown(["a", "b", "c"], interactive=True, container=False, elem_id="here2")
            gr.Number(container=False)
            gr.Textbox(container=False)

    with gr.Row():
        with gr.Column():
            gr.Dropdown(["a", "b", "c"], interactive=True, container=False, elem_id="here2")
        with gr.Column():
           gr.Number(container=False)
        with gr.Column():
            gr.Textbox(container=False)

if __name__ == "__main__":
    demo.launch()
