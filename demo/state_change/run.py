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

    list_state = gr.State([])
    dict_state = gr.State(dict())
    nested_list_state = gr.State([])
    set_state = gr.State(set())

    def transform_list(x):
        return {n: n for n in x}, [x[:] for _ in range(len(x))], set(x)
    
    list_state.change(
        transform_list,
        inputs=list_state,
        outputs=[dict_state, nested_list_state, set_state],
    )

    all_textbox = gr.Textbox(label="Output")
    change_count = gr.Number(label="Changes")
    gr.on(
        inputs=[change_count, dict_state, nested_list_state, set_state],
        triggers=[dict_state.change, nested_list_state.change, set_state.change],
        fn=lambda x, *args: (x+1, "\n".join(str(arg) for arg in args)),
        outputs=[change_count, all_textbox],
    )

    count_to_3_btn = gr.Button("Count to 3")
    count_to_3_btn.click(lambda: [1, 2, 3], outputs=list_state)
    zero_all_btn = gr.Button("Zero All")
    zero_all_btn.click(
        lambda x: [0] * len(x), inputs=list_state, outputs=list_state
    )

if __name__ == "__main__":
    demo.launch()