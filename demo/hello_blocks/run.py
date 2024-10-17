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
    with gr.Tab("abc"):
        gr.Textbox(label="abc")
    with gr.Tab("def", visible=False) as t:
        gr.Textbox(label="def")

    b = gr.Button("Make visible")

    b.click(lambda: gr.Tab(visible=True), inputs=None, outputs=t)

demo.launch()
