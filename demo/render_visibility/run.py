import gradio as gr


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem("Tab 1"):
            t = gr.Textbox("Some value", label="Name", visible=False)
            btn = gr.Button("Show")
            btn.click(lambda: gr.Textbox(visible=True), inputs=None, outputs=t)
        with gr.TabItem("Tab 2"):
            t2 = gr.Textbox("Some other value", label="Name", visible=False)
            btn2 = gr.Button("Show")
            btn2.click(lambda: gr.Textbox(visible=True), inputs=None, outputs=t2)

if __name__ == "__main__":
    demo.launch()
