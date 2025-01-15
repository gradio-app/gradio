import gradio as gr

with gr.Blocks() as demo:
    with gr.Tab("abc"):
        gr.Textbox(label="abc")
    with gr.Tab("def", visible=False) as t:
        gr.Textbox(label="def")
    with gr.Tab("ghi"):
        gr.Textbox(label="ghi")
    with gr.Tab("jkl", visible=False) as t2:
        gr.Textbox(label="jkl")
    with gr.Tab("mno"):
        gr.Textbox(label="mno")
    with gr.Tab("pqr", visible=False) as t3:
        gr.Textbox(label="pqr")
    with gr.Tab("stu"):
        gr.Textbox(label="stu")
    with gr.Tab("vwx", visible=False) as t4:
        gr.Textbox(label="vwx")
    with gr.Tab("yz"):
        gr.Textbox(label="yz")
    b = gr.Button("Make visible")

    b.click(
        lambda: [
            gr.Tab(visible=True),
            gr.Tab(visible=True),
            gr.Tab(visible=True),
            gr.Tab(visible=True),
        ],
        inputs=None,
        outputs=[t, t2, t3, t4],
    )

if __name__ == "__main__":
    demo.launch()
