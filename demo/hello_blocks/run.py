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
        b = gr.Button("Make visible")
    with gr.Tab("def", visible=False) as t:
        pass
    with gr.Tab("ghi"):
        pass
    with gr.Tab("jkl"):
        pass
    with gr.Tab("mno"):
        pass
    with gr.Tab("pqr"):
        pass
    with gr.Tab("stu"):
        pass
    with gr.Tab("vwx"):
        pass
    with gr.Tab("yz"):
        pass
    with gr.Tab("abc"):
        pass
    with gr.Tab("def"):
        pass
    with gr.Tab("ghi"):
        pass
    with gr.Tab("jkl"):
        pass
    with gr.Tab("mno"):
        pass
    with gr.Tab("pqr"):
        pass
    with gr.Tab("stu"):
        pass
    with gr.Tab("vwx"):
        pass
    with gr.Tab("yz"):
        pass

    b.click(lambda: gr.Tab(visible=True), None, t)

demo.launch()
