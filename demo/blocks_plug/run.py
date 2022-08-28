import gradio as gr


def change_tab():
    return gr.Tabs.update(selected=2)


identity_demo, input_demo, output_demo = gr.Blocks(), gr.Blocks(), gr.Blocks()

with identity_demo:
    gr.Interface(lambda x: x, "text", "text")

with input_demo:
    t = gr.Textbox(label="Enter your text here")
    with gr.Row():
        btn = gr.Button("Submit")
        clr = gr.Button("Clear")
    clr.click(lambda x: "", t, t)

with output_demo:
    gr.Textbox("This is a static output")

with gr.Blocks() as demo:
    gr.Markdown("Three demos in one!")
    with gr.Tab("Text Identity", id=0):
        identity_demo.render()
    with gr.Tab("Text Input", id=1):
        input_demo.render()
    with gr.Tab("Text Static", id=2):
        output_demo.render()
    btn = gr.Button("Change tab")
    btn.click(inputs=None, outputs=tabs, fn=change_tab)

if __name__ == "__main__":
    demo.launch()
