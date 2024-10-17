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
    with gr.Tab("ghi"):
        gr.Textbox(label="ghi")
    with gr.Tab("jkl"):
        gr.Textbox(label="jkl")
    with gr.Tab("mno"):
        gr.Textbox(label="mno")
    with gr.Tab("pqr"):
        gr.Textbox(label="pqr")
    with gr.Tab("stu"):
        gr.Textbox(label="stu")
    with gr.Tab("vwx"):
        gr.Textbox(label="vwx")
    with gr.Tab("yz"):
        gr.Textbox(label="yz")
    with gr.Tab("123"):
        gr.Textbox(label="123")
    with gr.Tab("456"):
        gr.Textbox(label="456")
    with gr.Tab("789"):
        gr.Textbox(label="789")
    with gr.Tab("000"):
        gr.Textbox(label="000")
    with gr.Tab("111"):
        gr.Textbox(label="111")
    with gr.Tab("222"):
        gr.Textbox(label="222")
    with gr.Tab("333"):
        gr.Textbox(label="333")
    with gr.Tab("444"):
        gr.Textbox(label="444")
    b = gr.Button("Make visible")

    b.click(lambda: gr.Tab(visible=True), inputs=None, outputs=t)

demo.launch()
