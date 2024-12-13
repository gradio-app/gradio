import gradio as gr

with gr.Blocks() as demo:

    with gr.Row():
        state_a = gr.State(0)
        btn_a = gr.Button("Increment A")
        value_a = gr.Number(label="Number A")
        btn_a.click(lambda x: x + 1, state_a, state_a)
        state_a.change(lambda x: x, state_a, value_a)
    with gr.Row():
        state_b = gr.State(0)
        btn_b = gr.Button("Increment B")
        value_b = gr.Number(label="Number B")
        btn_b.click(lambda x: x + 1, state_b, state_b)

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
    click_count = gr.Number(label="Clicks")
    change_count = gr.Number(label="Changes")
    gr.on(
        inputs=[change_count, dict_state, nested_list_state, set_state],
        triggers=[dict_state.change, nested_list_state.change, set_state.change],
        fn=lambda x, *args: (x + 1, "\n".join(str(arg) for arg in args)),
        outputs=[change_count, all_textbox],
    )

    count_to_3_btn = gr.Button("Count to 3")
    count_to_3_btn.click(lambda: [1, 2, 3], outputs=list_state)
    zero_all_btn = gr.Button("Zero All")
    zero_all_btn.click(lambda x: [0] * len(x), inputs=list_state, outputs=list_state)

    gr.on(
        [count_to_3_btn.click, zero_all_btn.click],
        lambda x: x + 1,
        click_count,
        click_count,
    )

    async def increment(x):
        yield x + 1

    n_text = gr.State(0)
    add_btn = gr.Button("Iterator State Change")
    add_btn.click(increment, n_text, n_text)

    @gr.render(inputs=n_text)
    def render_count(count):
        for i in range(int(count)):
            gr.Markdown(value = f"Success Box {i} added", key=i)
    
    class CustomState():
        def __init__(self, val):
            self.val = val

        def __hash__(self) -> int:
            return self.val

    custom_state = gr.State(CustomState(5))
    with gr.Row():
        btn_10 = gr.Button("Set State to 10")
        custom_changes = gr.Number(0, label="Custom State Changes")
        custom_clicks = gr.Number(0, label="Custom State Clicks")

    custom_state.change(increment, custom_changes, custom_changes)
    def set_to_10(cs: CustomState):
        cs.val = 10
        return cs

    btn_10.click(set_to_10, custom_state, custom_state).then(
        increment, custom_clicks, custom_clicks
    )

    @gr.render()
    def render_state_changes():
        with gr.Row():
            box1 = gr.Textbox(label="Start State")
            state1 = gr.State()
            box2 = gr.Textbox()
            state2 = gr.State()
            box3 = gr.Textbox(label="End State")

            iden = lambda x: x
            box1.change(iden, box1, state1)
            state1.change(iden, state1, box2)
            box2.change(iden, box2, state2)
            state2.change(iden, state2, box3)
            
if __name__ == "__main__":
    demo.launch()
