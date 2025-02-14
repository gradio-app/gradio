import gradio as gr

def change_tab():
    return gr.Tabs(selected=2)

identity_demo, input_demo, output_demo = gr.Blocks(), gr.Blocks(), gr.Blocks()

with identity_demo:
    gr.Interface(lambda x: x, "text", "text")

with input_demo:
    t = gr.Textbox(label="Enter your text here")
    with gr.Row():
        btn = gr.Button("Submit")
        clr = gr.ClearButton(t)

with output_demo:
    gr.Textbox("This is a static output")

with gr.Blocks() as demo:
    gr.Markdown("Three demos in one!")
    with gr.Tabs(selected=1) as tabs:
        with gr.TabItem("Text Identity", id=0) as tab0:
            tab0.select(lambda: gr.Tabs(selected=0), None, tabs)
            identity_demo.render()
        with gr.TabItem("Text Input", id=1) as tab1:
            tab1.select(lambda: gr.Tabs(selected=1), None, tabs)
            input_demo.render()
        with gr.TabItem("Text Static", id=2) as tab2:
            tab2.select(lambda: gr.Tabs(selected=2), None, tabs)
            output_demo.render()
    btn = gr.Button("Change tab")
    btn.click(inputs=None, outputs=tabs, fn=change_tab, js=True, preprocess=False, postprocess=False)

if __name__ == "__main__":
    demo.launch()
