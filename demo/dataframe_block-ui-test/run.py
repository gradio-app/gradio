import gradio as gr

with gr.Blocks() as demo:
    count = gr.Slider(minimum=1, maximum=10, step=1, label="count")
    data = gr.DataFrame(
        headers=["A", "B"], col_count=(2, "fixed"), type="array", interactive=True
    )
    btn = gr.Button(value="click")
    btn.click(
        fn=lambda cnt: [[str(2 * i), str(2 * i + 1)] for i in range(int(cnt))],
        inputs=[count],
        outputs=[data],
    )

demo.launch()
