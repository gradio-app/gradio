import gradio as gr

with gr.Blocks() as demo:

    with gr.Row():
        state_a = gr.State(0)
        btn_a = gr.Button("Increment A")
        value_a = gr.Number(label="A")
        btn_a.click(lambda x: x+1, state_a, state_a)
        state_a.change(lambda x: x, state_a, value_a)
    with gr.Row():
        state_b = gr.State(0)
        btn_b = gr.Button("Increment B")
        value_b = gr.Number(label="num")
        btn_b.click(lambda x: x+1, state_b, state_b)

        @gr.on(inputs=state_b, outputs=value_b)
        def identity(x):
            return x

    @gr.render(inputs=[state_a, state_b])
    def render(a, b):
        for x in range(a):
            with gr.Row():
                for y in range(b):
                    gr.Button(f"Button {x}, {y}")

if __name__ == "__main__":
    demo.launch()